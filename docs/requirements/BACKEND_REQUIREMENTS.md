# Backend requirements

This document defines the accepted backend contract, not a list of completed features.
Registration is implemented; login/session routes remain design requirements.
The [backend guide](../../backend/README.md) owns commands and the
[coverage summary](../planning/VALIDATION.md) owns verification evidence.

## System boundaries

Use application-owned identity, Nest/Express, TypeORM repositories/Data Mapper and PostgreSQL.
[ADR 0001](../architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) owns the stack decision.
The frontend still uses Stack Auth; its replacement is a separate integration.

The [SRS](TenantFlow-SRS.md#24-canonical-release-boundaries) owns product scope and tenant rules.
Global identity does not grant tenant access. Every tenant-owned read/write must check membership and permission,
including child resources, joins, assignments and file access.

Root schemas.ts and enum.ts are design references, not a requirement to create every modeled table.
Provisional field lengths and provider models do not become constraints without a consuming requirement.
Use explicit UUIDs, foreign keys, tenant-aware uniqueness, soft deletion and retained history.

## API and integration boundaries

Validate input at the boundary and enforce durable invariants in services and the database.
Return explicit response objects; never serialize secrets, hashes, unrestricted entities or internal relationships.
Use HTTPS in production and keep credentials out of logs and browser-public configuration.

Lists require bounded pagination and tenant-aware queries.
Audit records retain actor, tenant, target, action and time without credential contents.
External clients require timeouts; state-changing retries require idempotency.

Provider webhooks require signature verification and delivery deduplication.
Payments use the SRS test-mode provider design; never handle raw card data.
File ownership/metadata belongs in PostgreSQL and binaries behind an authorized storage boundary.
Queues, cache and live delivery are implementation choices, not prerequisites for basic domain behavior.
Hosting is not selected. Preserve the development PostgreSQL volume.

## Accepted initial session-auth contract

The first slice is registration, login, caller read and current-session logout.
Verification delivery, recovery, password change, logout-all and frontend replacement have separate designs.
The password policy below reflects the developer's accepted 24 November 2026 revision.
These project rules are not a standards-compliance claim.

### Email

Use one global account per canonical email, including soft-deleted accounts.
Trim outer whitespace, preserve the trimmed spelling for display and lowercase the whole address for identity.
Preserve dots and plus tags. Lowercasing the local part is a deliberate product policy.

Accept ASCII mailbox addresses up to 254 characters, with a local part up to 64 and a dotted DNS domain.
Reject display names, quoted local parts, IP literals and Unicode mailbox input.
ASCII punycode domains are allowed. Registration and login use the same identity rule.

### Password and blocklist

Require 8-128 Unicode code points, at least one lowercase ASCII letter, uppercase ASCII letter,
ASCII digit and a symbol recognized by the installed isStrongPassword validator; ASCII space counts as a symbol.
Preserve the exact string without trimming, normalization or truncation.
Reject unpaired UTF-16 surrogates and enforce code-point bounds before hashing.

The validator's UTF-16 length check does not replace the explicit maximum and Unicode safeguards.
Use maintained Argon2id; the current implementation uses 64 MiB, two iterations and parallelism one.
Deployment parameters require measurement on the actual runtime.

Registration and password replacement compare the complete password against a checksum-pinned local blocklist.
Keep source commit, SHA-256, license and maintained additions with the assets; review the snapshot monthly.
Missing or corrupt data is an operational failure, not an empty list.
Do not apply this blocklist to login or send raw passwords to third parties.
The common-password snapshot is not comprehensive breach screening.

### Registration and account states

Create the user and credential atomically, with pending_verification status and no automatic session.
Validate and blocklist-check duplicate requests too, and hash before opening the transaction.
Valid new/duplicate input receives the same generic 202 without IDs, credentials or email-delivery claims.
Duplicates must not change existing credentials. Database uniqueness resolves concurrent identity conflicts.

Statuses are active, inactive, pending_verification, frozen and deleted.
Correct credentials may establish a restricted pending-verification session for caller read/logout.
Only active accounts are eligible for normal business access, subject to authorization.
Inactive, frozen and deleted accounts cannot authenticate; subsequent requests reflect current eligibility.
Deletion is terminal in this slice.

### Session credentials and lifetime

Generate 32 cryptographically random bytes and encode unpadded base64url: 43 characters.
Persist only the SHA-256 digest of that ASCII credential as 64 lowercase hexadecimal characters.
Reject malformed credentials before lookup. Each successful login creates a new session; multiple devices are allowed.

Use a 30-minute idle limit and 24-hour absolute limit, measured from creation with database time.
A session is invalid at equality with either deadline.
A successful guarded resolution conditionally advances activity and idle expiry to
min(database time + 30 minutes, absolute expiry), preserving monotonic timestamps and the same credential.
Refresh the cookie only for the remaining valid lifetime; never extend the absolute deadline.

Resolution checks digest, expiry, revocation and account eligibility.
Expired/revoked rows must not be renewed or recreated.
Login locks/rechecks the user row; eligibility changes use a consistent lock order and revoke sessions atomically.
Reactivation must not revive revoked sessions. Authentication alone grants no tenant permissions.

Revoke before clearing the current cookie. Missing/already invalid logout is idempotent 204.
Persistence failure must not be reported as successful logout.
Clear malformed/missing/invalid cookie credentials using the same cookie scope.
A response already in flight cannot make a revoked database session valid again.

Retain invalid sessions for seven days after the earliest idle expiry, absolute expiry or revocation.
Cleanup is bounded and rechecks eligibility; deletion of old rows does not enforce live session validity.

### Browser and HTTP behavior

Local frontend origin is http://localhost:3000; browser API URL is http://localhost:14400.
Listen explicitly on 127.0.0.1 with local PORT=14400 and proxy trust disabled.
Grant credentialed CORS only to that exact frontend origin.

Use Nest 12.1+ native CSRF protection with that trusted origin and no auth exclusions.
Preserve its Fetch Metadata/Origin algorithm, including same-origin/none, matching authority fallback,
requests with neither browser header and safe GET/HEAD/OPTIONS methods. No CSRF-token route is needed.
CORS and SameSite do not replace CSRF checks.

Production uses one HTTPS browser origin with external /api proxy routing.
Nest routes remain /auth/... with no global prefix. Verify trusted proxy/Host forwarding before deployment.
Safe methods do not perform user-requested state changes; authenticated reads may perform explicit idle renewal.
Assembled HTTP tests use the same bootstrap protections as the application.

Register/login require application/json objects with only email/password strings.
Reject unknown fields, bodies over 16 KiB and non-identity content encoding.
Logout accepts an empty body or empty JSON object when implemented.
Auth responses use Cache-Control: no-store.

Count admitted attempts after security/body parsing and before DTO validation, hashing or database work.
Registration allows five per direct socket IP per 3,600 seconds; login allows ten per 60 seconds.
DTO-invalid/failed-credential attempts count. Key by route and socket IP; return 429 with Retry-After.
Use single-process memory locally. Shared limits and trusted proxies need a deployment-specific design.

### Cookies and response contracts

Production cookie: __Host-tenantflow_session, HttpOnly, Secure, SameSite=Lax, Path=/, no Domain.
Local cookie: tenantflow_session_dev, HttpOnly, SameSite=Lax, Path=/, host-only, Secure disabled.
Max-Age is whole seconds rounded down from remaining min(idle, absolute) validity.
Clearing uses the same name/path/domain scope.

POST /auth/register returns 202 with { message: "Registration request accepted." }.
POST /auth/login returns 200 and a cookie; GET /auth/me returns 200 for a valid session.
Login/me expose only { user: { id, email, status, emailVerified } }, using display email and stored verification state.
POST /auth/logout returns 204 without a body.

Errors use { statusCode, code, message } with fixed safe messages:

- 400 INVALID_INPUT.
- 401 INVALID_CREDENTIALS for login, AUTH_REQUIRED for session resolution.
- 403 CSRF_REJECTED.
- 413 PAYLOAD_TOO_LARGE; 415 UNSUPPORTED_MEDIA_TYPE.
- 429 RATE_LIMITED; expose Retry-After to the allowed browser origin.
- 503 SERVICE_UNAVAILABLE for recognized persistence unavailability.
- 500 INTERNAL_ERROR for unexpected faults.

Login verifies either the stored hash or a maintained dummy hash for an unknown account.
Return generic credential/eligibility denial without promising identical timing.
Input, throttling and persistence failures remain distinguishable.

### Minimal auth persistence mapping

Use explicit snake_case names and timestamptz(3) instants. Columns are NOT NULL unless stated otherwise.
The three identity tables are global and contain no tenant IDs, roles, profile data or provider credentials.
Generate User/Session UUID v4 values in the application; no database UUID extension is needed.

User / users:

- id uuid primary key; email varchar(254); email_canonical varchar(254), COLLATE C, unconditionally unique.
- status varchar(32), default pending_verification, checked against the five exact status strings.
- email_verified_at and deleted_at nullable; created_at/updated_at default CURRENT_TIMESTAMP(3).
- Active requires verification; pending_verification requires no verification timestamp.
- Deleted status is equivalent to a non-null deleted_at; other ineligible states may retain verification.
- Stored email is trimmed printable ASCII and nonempty; canonical email equals lower(email COLLATE C).

PasswordCredential / password_credentials:

- user_id uuid is both primary key and foreign key to users.id.
- password_hash is nonempty text containing the full encoded Argon2 hash, excluded from default ORM selection.
- created_at defaults to CURRENT_TIMESTAMP(3); password_changed_at is nullable until first replacement.

Session / sessions:

- id uuid primary key; user_id uuid foreign key; credential_digest varchar(64) unconditionally unique.
- credential_digest is exactly 64 lowercase hexadecimal characters and excluded from default ORM selection.
- created_at defaults to CURRENT_TIMESTAMP(3); last_seen_at, idle_expires_at and absolute_expires_at are explicit.
- revoked_at is nullable. Initial activity equals creation; initial deadlines are creation + 30 minutes/+24 hours.
- Check created_at <= last_seen_at < idle_expires_at <= absolute_expires_at.
- Check revoked_at is null or >= created_at, and all stored session lifecycle instants are finite.
- Index user_id for account-wide revocation. Do not add speculative cleanup indexes.

All user foreign keys use ON DELETE RESTRICT and ON UPDATE RESTRICT.
Disable relation cascades, eager/lazy relation loading and automatic orphan deletion.
Credential uniqueness establishes at most one row; the registration transaction establishes both local records.

Services maintain update/activity/revocation/password-change timestamps explicitly.
Serialize exposed instants as UTC ISO 8601 and use one consistent database time per lifecycle operation.
Database creation defaults do not maintain later updates. Never use now()-dependent CHECK constraints for validity.

Runtime and CLI register the same explicit entities and migrations.
Keep synchronize and migrationsRun false; review SQL and verify migrations in isolation before applying to retained data.
See the [migration guide](../../backend/src/database/migrations/README.md) and
[PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html).

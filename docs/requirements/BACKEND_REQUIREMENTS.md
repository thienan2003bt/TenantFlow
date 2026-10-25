# Backend Requirements and Design Notes

The NestJS application in `backend/` has configuration validation, HTTP liveness, TypeORM runtime wiring and a standalone migration DataSource. Domain entities, feature migrations and authentication are not implemented; real PostgreSQL behavior remains unverified. The frontend still uses the inherited Stack Auth integration pending replacement.

The developer implements the backend inside `backend/`, alongside `frontend/`. The [backend README](../../backend/README.md) documents current startup, configuration, health behavior and test coverage. Broader requirements below follow in later milestones. Use [engineering conventions](../architecture/BACKEND_CONVENTIONS.md) for responsibility and review rules; explicit tooling requests do not authorize automatically implementing review findings.

Use the [SRS](TenantFlow-SRS.md) for product rules, [schema references](../../schemas.ts) and [enums](../../enum.ts) for provisional model vocabulary, and the [roadmap](../planning/ROADMAP.md) for implementation sequencing. This document owns backend constraints, accepted auth policies and unresolved design choices.

## 1. Boundaries and identity ownership

- TenantFlow is a portfolio and backend-learning project with application-owned session authentication, PostgreSQL and TypeORM/Data Mapper. Use maintained cryptographic libraries. [ADR 0001](../architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) owns the stack decision; the accepted contract below owns auth policies. Hosting remains open, with provider choice based on cost, capability and maintenance.
- Keep business rules independent of HTTP handlers, persistence details, storage providers, and payment/email SDKs. Separate request/response contracts from stored entities; introduce abstractions where they make an integration replaceable or a boundary testable.
- The frontend currently uses Stack Auth for sign-in, account management, and teams. The target backend owns local users, credentials, sessions, organizations, memberships and permissions. Design the transition separately; do not make provider-team synchronization a prerequisite for new domain behavior. Never trust a client-supplied tenant ID without checking membership and permissions.
- Global user identities and platform roles differ from tenant-owned memberships and tenant/project roles. A global identity must not grant access to every tenant.
- Root model references use UUIDs. Define local identity uniqueness, credential/session ownership and account-deletion behavior before implementation. If external identities are added later, do not assume provider IDs match domain UUIDs; define mapping and synchronization at that time.
- User identity, profile, session, authentication-factor, and verification/reset-token concepts are represented by `User`, `UserIdentity`, `UserProfile`, `UserSession`, `AuthFactor`, and `UserToken`. Implement the required outcomes with a minimal local model; reference classes are not a requirement to create every table now. Do not carry template-provider credentials into the new local store.
- The five `UserStatus` values remain `active`, `inactive`, `pending_verification`, `frozen`, and `deleted` in the root enum reference. Authentication factors and verification/reset/MFA token types are also preserved there. MFA is a later enhancement under the [canonical SRS release boundaries](TenantFlow-SRS.md#24-canonical-release-boundaries); model support is not an MVP implementation commitment.

## 2. Data integrity and lifecycle

The SRS sections 7-8 remain authoritative for tenant boundaries, UUIDs, foreign keys, explicit join tables, soft deletion, and retained history. Validate a tenant-owned child through its parent as well as its own identifiers. System-level records may have no tenant; this must be explicit rather than an unscoped query exception.

The following model candidates require review against the accepted contract and SRS before becoming schema constraints:

| Topic | Candidate retained for review | Decision required |
| --- | --- | --- |
| User identifiers | Canonical email uniqueness is accepted; a required slug and 255-character lengths remain candidates. | Settle email case/length rules. Decide whether a slug is needed and define collision behavior before adding it. |
| Role/permission vocabulary | Required scope and name; candidate scope length 50, name length 255, description required. | Enforce system/tenant/project scope consistency with nullable tenant/project references and assignment boundaries. |
| Role joins | Unique `(role_id, permission_id)` and `(user_id, role_id)` pairs. | Add appropriate uniqueness for tenant/member/project assignment joins and prevent cross-scope assignments. |
| External identities | Candidate unique `(provider, provider_user_id)`; provider length 50, provider user ID length 255. Local credentials were modeled with a nullable provider. | Define local/provider identity uniqueness and null behavior explicitly; do not rely on a nullable unique index alone. |
| Sessions | Persist an opaque credential digest with expiry/revocation/activity timestamps under the accepted contract. Optional metadata candidates: IP 45, user agent 500 and device 255 characters. | Settle renewal persistence, retention and necessary metadata. Enforce expiry independently of cleanup; do not add refresh-token fields to this session design. |
| Authentication factors | Type, display name (candidate length 255), enabled/primary flags, verification/last-used timestamps, and provider-specific metadata modeled as JSONB. | Future factor design must protect secret metadata and identify application/provider ownership. MFA is outside the initial slice. |
| User profiles | Optional first/last name (100 each), phone (20), location (255), bio (500), avatar URL (500); one profile per user. | Recheck lengths and one-to-one uniqueness against product/provider needs; these were example limits. |
| Verification/reset tokens | Hash, purpose, expiry and used/revoked timestamps; optionally one unused/unrevoked token per user and purpose. | Design issuance, single use, expiry and reissue with the consuming flow. Review PostgreSQL constraints explicitly before migrating. |
| UUIDs and enum storage | UUID primary keys and stable lifecycle strings. | Choose application/database UUID generation deliberately; never rely on retired language enum ordinals. |
| Timestamps | Creation/update/deletion timestamps and UTC semantics. | Decide timezone-aware storage and who updates `updated_at`; a default alone does not update it on writes. |
| Deletion | Soft deletion and retained history are required; physical deletion behavior remains a design choice. | Reconcile every foreign key with SRS historical-data rules. Do not cascade-delete audit/billing history or bypass retention policy. |

The root model files remain design references, not migrations or runtime validators. Known naming issues include comments referring to `Project.id` and `UserMembership.id` where types are named `TenantProject` and `TenantMembership`. Reconcile `User.role_id`, system-role assignments and membership/project-role assignments into one authorization model before implementing those relationships.

## 3. API and security requirements

- Account lifecycle outcomes include registration, verification, sign-in/out, session renewal/revocation, password reset/change and future MFA. Use the selected opaque cookie sessions and accepted first-slice routes below. Settle the remaining CSRF and lifecycle details before implementation. MFA remains future scope.
- Validate incoming data at the API boundary and enforce domain invariants in services and database constraints where practical. Keep validation, authentication, authorization, missing-record, and unexpected-failure outcomes distinguishable without disclosing sensitive internals.
- Return explicit response contracts. Never serialize password hashes, session digests, verification/reset-token hashes, authentication secrets or internal entity relationships directly to clients. Email/profile exposure must respect the caller's permissions.
- Use maintained Argon2id and cryptographic randomness/digest implementations for the accepted password/session design; do not implement cryptographic primitives.
- Use HTTPS for production traffic and avoid sensitive-data logging; local debugging instructions must not expose credentials or token contents.
- Enforce tenant isolation and permission checks for reads and writes, including nested resources, list/filter endpoints, assignment joins, and file access. UI visibility and frontend team selection do not enforce API authorization.
- Common lists need pagination/filtering and tenant-aware indexes. Preserve append-only audit records with actor, tenant, target, action and time; consider safe old/new-value metadata without logging credentials.
- Keep API contracts documented with OpenAPI and a discoverable exploration interface when implemented. The existing `/health-check` is liveness only; readiness and database connectivity checks remain future implementation work.
- Plan structured, redacted logs, correlation, diagnosable errors, optional tracing/metrics, rate limiting and tests for tenant isolation, permissions, session lifecycle and integration boundaries. Supporting tools are selected in ADR 0001; exact error and abuse-control policies remain in the Step 1 worksheet.

## 4. Integrations and operations

- PostgreSQL with TypeORM repositories/Data Mapper is selected; the existing PostgreSQL service remains the development baseline. Host processes use PostgreSQL's published local port; containers on the Compose network use the service hostname. Schema changes need reviewed TypeORM migrations and an explicit verification procedure. Preserve the current Compose data/volume configuration.
- Keep outbound integration clients bounded by timeouts and appropriate retry/circuit-breaking policies. Retry state-changing calls only with an idempotency strategy.
- Retain billing plans/limits, provider webhook verification and idempotency, append-only billing history and test-mode payment integration. Stripe is the planned provider in the SRS; no payment SDK is installed. Never handle raw card data.
- Keep email verification/reset/invitation delivery requirements and optional later notification delivery. Notification preferences, read state, and tenant-aware records must work independently of any optional live-push transport.
- Store file metadata and ownership in the selected relational database; keep binaries behind a storage boundary, with local storage possible for development and object storage later. Cloudflare R2 is a later candidate, not configured storage. Preserve size/type validation and authorized download requirements.
- Plan lightweight background processing before durable scheduling. Notification delivery, retry behavior and webhook work must remain traceable and recoverable. Choose scheduling/queue tools only when needed.
- Keep caching optional: tenant-aware keys, appropriate invalidation, local in-memory lookups where useful, and a distributed cache only when justified. Redis, mail-testing services, durable workers, live-push transports and tracing infrastructure are not configured in this checkout.
- Extend the existing startup-validated environment configuration as consumers are added; use managed secrets when deploying. Identity, email, storage and billing settings need actual consumers before becoming required variables. Separate environment credentials and never expose server secrets through browser-public variables or logs.

## 5. Decisions before implementation

1. Use the [canonical SRS release boundaries](TenantFlow-SRS.md#24-canonical-release-boundaries) and reconciled version plan as the scope baseline. Record any requested scope change explicitly; old dates, checkboxes and future model fields do not establish completed delivery or new commitments.
2. Retain Nest/Express, npm, ESM/NodeNext, Vitest/Vite and the selected TypeORM migration workflow. Verify real PostgreSQL behavior and standardize supported runtime versions before extending persistence.
3. Close the remaining first-slice auth details, then design the later account lifecycle, organizations/memberships and permission ownership. Stack Auth replacement is a later frontend transition.
4. Review the data-integrity candidates above and produce a consistent schema/ERD with tenant-aware constraints and retention rules.
5. Define the first API contracts, environment contract, startup commands, health checks, container/CI wiring and meaningful tests alongside the actual backend source.

### Accepted initial session-auth contract

Accepted on 25 October 2026. These policies define the initial slice; authentication is not implemented or runtime-verified.

| Concern | Accepted behavior |
| --- | --- |
| Initial scope | Register -> login -> authenticated caller read -> current-session logout. Verification delivery, recovery/password change, logout-all, session-management UI and frontend replacement remain follow-ups. |
| Email identity | One global account per canonical email. Trim surrounding email whitespace, apply one consistent case policy, preserve plus tags and dots, and enforce uniqueness in PostgreSQL. Exact case policy remains a close-out item below. |
| Password inputs | Minimum 6, maximum 128 Unicode code points; permit spaces/passphrases, prohibit composition rules, trimming and truncation, and bound HTTP input size. Reject common/known-compromised values using a selected blocklist. Unicode normalization, blocklist source/update policy and exact body limit still require close-out. |
| Password security distinction | Argon2id remains selected. Six characters is the developer's explicit project policy and is below NIST SP 800-63B's 15-character recommendation for password-only authentication; do not describe it as meeting that password-length requirement. |
| Account states | Registration creates `pending_verification` with no automatic login. Correct credentials may establish a restricted session for caller read and logout. Only `active` users are eligible for normal business access, subject to authorization. Inactive/frozen/deleted accounts cannot authenticate; subsequent requests must reflect current eligibility. |
| Registration duplicates | Valid new and duplicate requests receive the same generic 202 without user IDs, session credentials or a claim that email was sent. Duplicates cannot replace credentials. Concurrent uniqueness is a database invariant; unrelated persistence faults remain failures. |
| Session credentials | Generate 32 cryptographically random bytes, encode as base64url and persist only a SHA-256 digest. Successful login creates a fresh session; permit multiple device sessions. |
| Session lifetime | Server-enforced 30-minute idle and 24-hour absolute expiry. Successful authenticated activity may extend idle expiry, never beyond absolute expiry. Conditional persistence must prevent renewal from restoring a revoked/expired session. |
| Resolution and logout | Check digest, expiry, revocation and current account eligibility. Revoke the current session before clearing its cookie. Missing/already invalid logout is idempotent 204; persistence failure is a controlled server/service error. Authentication does not grant tenant membership or permissions. |
| Browser topology | Local frontend `http://localhost:3000` and API `http://localhost:14400`; exact credentialed CORS origin and credentialed browser requests. Production target is one HTTPS browser origin with `/api` proxy routing, not configured routing. |
| Cookies | Production: `__Host-tenantflow_session`, HttpOnly, Secure, SameSite=Lax, Path=/, no Domain. Local loopback HTTP: a separate unprefixed name, HttpOnly, SameSite=Lax, Path=/, host-only, Secure disabled. Browser expiry cannot exceed server policy; clearing must match cookie scope. |
| CSRF | Protect unsafe browser methods, including registration/login/logout. The exact strategy and missing-header behavior remain open in the Step 1 worksheet; CORS and SameSite alone are insufficient. |
| Minimal persistence | User (UUID, original/canonical email, status, verification and lifecycle timestamps), password credential (user reference, encoded hash, password-change timestamp) and session (user reference, unique digest, creation/activity/expiry/revocation timestamps). Exactly one password credential per user; registration writes are atomic. Nullability, timestamp ownership and deletion policy require close-out before mappings. |
| HTTP contract | POST `/auth/register`: generic 202, invalid input 400. POST `/auth/login`: 200 with safe user fields and cookie, generic credential/eligibility failure 401. GET `/auth/me`: 200 with approved caller fields, invalid/missing/expired/revoked session 401. POST `/auth/logout`: 204 with revocation/clearing, subject to CSRF and persistence-error rules. These are planned routes. |
| Acceptance matrix | Cover canonical/concurrent duplicates, invalid input/password, all account states and status changes, rollback, secret-free responses/logs, cookie issuance/sending/clearing, expiry/renewal, independent sessions, replay/concurrent logout, CSRF/origin denial, throttling and database failure. Future tests must use real PostgreSQL and a browser where their behavior is the subject. |

The [Step 1 worksheet](../SESSION_AUTH_DEVELOPMENT_PLAN.md#remaining-step-1-close-out-decisions) owns the remaining proposed defaults. Settle those choices before auth mappings/handlers; independent database connection checks can proceed meanwhile. Accepted policies above remain in force.

Reference: [NIST password guidance](https://pages.nist.gov/800-63-4/sp800-63b.html). Project timeout values and endpoint names are accepted choices rather than standards-mandated values.

### Current identity and database decisions

[ADR 0001](../architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) owns the selected architecture and evaluated alternatives. Current implementation evidence belongs in the [validation register](../planning/VALIDATION.md); the [roadmap](../planning/ROADMAP.md#current-priorities-and-learning-preferences) owns sequencing.

| Concern | Selected direction | Remaining work |
| --- | --- | --- |
| Identity ownership | Application-owned credentials and account lifecycle. | Implement and verify the accepted first slice, then the remaining SRS lifecycle. Replace template Stack Auth separately. |
| Sessions | Opaque cookie credentials, PostgreSQL digest storage, a session service and a Nest guard. | Settle the remaining Step 1 defaults; implement expiry, renewal, revocation, browser protection and meaningful concurrency tests. |
| Persistence | PostgreSQL, TypeORM repositories/Data Mapper, reviewed migrations, synchronization disabled. | Runtime/CLI configuration is wired and dependencies are installed. Verify real connections/shutdown, entity mappings, migration execution and transaction behavior. |
| Password hashing | Argon2id through a maintained implementation. | Install with its consumer, benchmark parameters and verify target-runtime support. No hashing implementation is verified yet. |
| Supporting tools | Existing DTO validation/configuration/Vitest plus the ADR-selected Swagger, Helmet, throttling and built-in JSON logging. | Introduce missing integrations with their consumers; verify error contracts, redaction and abuse controls. |
| Hosting | Compare suitable API/frontend/PostgreSQL/email providers by effective cost, capability and maintenance. | Verify runtime/hashing compatibility, deployment topology, delivery support, current prices and quotas before selection. No provider is selected. |

Before the first domain migration, settle canonical email handling, credential/session ownership, expiry/renewal/retention, foreign keys and timestamp/deletion rules. Verification/reset-token tables follow their consuming lifecycle designs. Retain the Nest application in `backend/` and preserve the existing PostgreSQL volume.

The backend currently supports its minimal HTTP/configuration foundation and database wiring. Domain persistence, authentication and tenant integration remain unfinished. Use [Start Here](../setup/START_HERE.md) and the [backend README](../../backend/README.md) for current local operation.

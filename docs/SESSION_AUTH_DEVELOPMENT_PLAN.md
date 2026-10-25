# Session authentication development plan

**Current step: 1 — accepted baseline; remaining decisions pending.** Finish Step 1 before starting Step 2, as requested by the developer. Working branch: `feat/session-auth`.

[Documentation index](README.md) · [Roadmap](planning/ROADMAP.md#current-priorities-and-learning-preferences) · [Accepted contract](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) · [Validation register](planning/VALIDATION.md#open-follow-ups)

## Scope and current state

The first slice covers registration, login, authenticated caller read and current-session logout. The developer accepted its baseline on 25 October 2026, including passwords of 6-128 Unicode code points. The [backend requirements](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) own the accepted account, password, session, browser and HTTP policies; the table below owns the remaining proposals.

[ADR 0001](architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) selects Nest/Express, TypeORM repositories with PostgreSQL, reviewed migrations, opaque database sessions and Argon2id. Runtime database configuration and a compiled CLI DataSource exist. Auth entities, feature migrations and auth handlers do not exist; real PostgreSQL and browser behavior remain unverified.

Keep implementation in `backend/`, preserve the frontend/assets/license and PostgreSQL volume, and use the [backend README](../backend/README.md) for commands. The developer writes backend behavior and runs generators/migrations.

## Development checkpoints

| Step | State | Completion evidence |
| --- | --- | --- |
| 1. Define the auth contract | CURRENT — baseline accepted; remaining decisions pending | Resolve the table below, then confirm the state flow, minimal entity sketch and acceptance matrix agree. No unresolved choice may change the initial schema or browser trust boundary. |
| 2. Validate TypeORM integration and migration workflow | Configuration implemented; runtime verification pending | Runtime/CLI wiring and static/loading checks are recorded in the validation register. Later, prove connection, shutdown and migration/transaction behavior against isolated PostgreSQL. |
| 3. Establish persistence | NOT STARTED | Implement the agreed entities and reviewed migration; prove uniqueness, foreign keys, rollback and database readiness without resetting the development volume. |
| 4. Implement the initial auth slice | NOT STARTED | Implement registration, password verification, sessions, caller read and logout with boundary validation, safe responses, CSRF and abuse controls. Verify the Nest request pipeline and real PostgreSQL. |
| 5. Verify browser behavior and failure cases | NOT STARTED | Verify cookie issuance/sending/clearing, origin/CSRF denial, expiry/revocation, concurrent registration/logout, hash secrecy and rollback. Add meaningful CI coverage. |
| 6. Close this tracker | NOT STARTED | Preserve accepted decisions in requirements and evidence/follow-ups in the validation register; repair incoming links and remove this temporary file after the slice is complete. |

## Step 1 — Define the session-auth contract

Work in this document from the repository root. This step requires no installation, generator, migration, environment change or application-code edit. Use the [SRS](requirements/TenantFlow-SRS.md#51-authentication) and [engineering conventions](architecture/BACKEND_CONVENTIONS.md) when settling the remaining choices. Root model files are vocabulary references, not approved tables.

### 1A. Account rules

The accepted contract covers global email identity, pending/active/ineligible account states, current account checks and generic duplicate registration. Settle the exact email case policy below.

### 1B. Password rules

The accepted policy is 6-128 Unicode code points, spaces/passphrases allowed, no composition rules, trimming or truncation, bounded input and common/compromised-password rejection. Settle Unicode treatment, the blocklist and the body limit below. The accepted contract records the difference from NIST's password-only length guidance.

### 1C. Session lifecycle

The accepted policy uses fresh random credentials with only digests persisted, multiple device sessions, 30-minute idle expiry, 24-hour absolute expiry and current-session revocation. Renewal must not exceed absolute expiry or restore revoked/expired sessions. Settle persistence frequency and retention below; expiry denial must work independently of cleanup.

### 1D. Browser transport and CSRF

The accepted topology uses credentialed local origins and a future single HTTPS production origin. Production and local cookie attributes are recorded in the accepted contract. Settle the exact CSRF strategy, development cookie name and proxy/prefix mapping below. Browser tests must cover trusted calls, untrusted origins, the chosen missing-header behavior and cookie clearing.

### 1E. Persistence and HTTP acceptance

The accepted contract defines the user/credential/session concepts and register/login/me/logout routes. Settle exact persistence ownership, response fields/errors and abuse limits below. Keep global identity separate from tenant memberships and permission checks; defer verification/reset-token tables until their consuming flows are designed.

**Step 1 exit check:** walk through canonical/concurrent duplicate registration, invalid input/password, every account state and state change, transaction rollback, independent sessions, idle/absolute expiry, renewal overlapping logout, replay, persistence failure, CSRF/origin denial, throttling and secret-free responses/logs. This is a future test matrix, not executed validation. Record settled policies in the owning requirements document before moving to Step 2.

### Remaining Step 1 close-out decisions

These defaults remain proposals awaiting a decision. Accepted policies do not need reconfirmation.

| Remaining detail | Proposed close-out default |
| --- | --- |
| Email case and password Unicode | Lowercase the entire trimmed email for canonical uniqueness; retain the original trimmed email for display. Count password length in Unicode code points, preserve exact input without Unicode normalization, and reject malformed Unicode rather than modifying it. |
| Blocklist and body limit | Start with a pinned, locally bundled snapshot of [SecLists' 10,000 common passwords](https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt), check exact whole-password matches on registration/change, review updates monthly, and add known-compromised values deliberately. This is a common-password baseline, not comprehensive breach screening. Limit auth JSON bodies to 16 KiB. Do not send raw passwords to third parties. |
| CSRF policy | Use [Nest 12.1 built-in Fetch Metadata/Origin protection](https://docs.nestjs.com/security/csrf), with only `http://localhost:3000` trusted for development and same-origin requests in production. Unsafe browser requests with untrusted origins are rejected; requests lacking both Sec-Fetch-Site and Origin are allowed per the framework policy. GET/HEAD/OPTIONS are allowed and must not perform user-requested state-changing operations; successful caller reads may renew idle expiry as explicitly agreed housekeeping. No separate CSRF token/bootstrap route. |
| Persistence ownership | Three separate records: user, one-to-one password credential and many sessions per user. Use application-generated UUIDs, PostgreSQL timezone-aware timestamps, database defaults for creation, and explicit service-owned update/activity timestamps. Canonical email and session digest are unique; credential user reference is unique. References and expiry fields are non-null; verification/revocation and password-change timestamps may be null until their event occurs. First-slice deletion is soft deletion through account state; foreign keys restrict physical user deletion. No cascading removal of retained history. |
| Renewal, cookie scope and retention | Persist idle renewal for each successful guarded request using a conditional update and cap it at absolute expiry. Use `tenantflow_session_dev` locally and the accepted production cookie name; cap cookie lifetime to the remaining server-valid window. Local Nest routes have no global prefix; the future production proxy maps external `/api/auth/...` to Nest `/auth/...`. Collect no IP/user-agent/device session metadata initially. Retain invalid session rows for 7 days after the earliest expiry/revocation, then make them eligible for cleanup; cleanup scheduling remains implementation work. |
| Responses and abuse limits | Use a safe error envelope with `statusCode`, stable `code` and `message`; classify input/authentication/CSRF/throttling/unavailable-persistence as 400/401/403/429/503, with 500 for unexpected faults. Caller responses expose only id, display email, status and a verification boolean. Start with 10 login requests per client IP per minute and 5 registration requests per client IP per hour, counting all attempts. Use direct socket IP locally with proxy trust disabled; select exact trusted proxies before deployment. Single-process rate-limit storage is sufficient for the local slice; revisit before scaling/public exposure. |

If built-in CSRF protection is selected, test its documented origin/header behavior rather than asserting token-based rejection. Real PostgreSQL and browser checks belong to subsequent checkpoints.

## Follow-up boundaries and handoff

The initial slice does not complete SRS authentication. Verification/email delivery, recovery/password change, logout-all, session management, renewal hardening and frontend Stack Auth replacement remain in the [roadmap](planning/ROADMAP.md) and [validation register](planning/VALIDATION.md). A pending-verification prototype does not establish full account activation. Organization isolation/RBAC and other business features retain their roadmap sequence.

Security references: [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [NIST password guidance](https://pages.nist.gov/800-63-4/sp800-63b.html). Implementation and verification evidence belong in the validation register.

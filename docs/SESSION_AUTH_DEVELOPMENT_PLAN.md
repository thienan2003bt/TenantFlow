# Session authentication development plan

Created 22 October 2026. Temporary working tracker for the first application-owned authentication slice. **Current step: 1 — define the contract.** No authentication, ORM integration or migrations have been implemented by this plan.

[Documentation index](README.md) · [Roadmap](planning/ROADMAP.md#current-priorities-and-learning-preferences) · [Backend requirements](requirements/BACKEND_REQUIREMENTS.md#current-identity-and-database-options) · [Validation register](planning/VALIDATION.md#open-follow-ups)

## Confirmed direction and remaining choices

| Topic | Confirmed direction | Still to decide |
| --- | --- | --- |
| Ownership | TenantFlow owns credentials, authentication and sessions. Stack Auth is inherited template code intended for later removal. | Replacement frontend integration and account migration, if actual accounts/data need preserving. |
| Authentication | Session-based authentication. | Opaque credential format/storage, browser transport, expiry, renewal, revocation and CSRF details below. JWT access/refresh tokens are not the selected starting design. |
| Persistence | PostgreSQL with an ORM, to gain practical ORM experience. | ORM/package versions, migration workflow and schema mappings. Prisma, TypeORM and Drizzle may be evaluated in Step 2; none is selected or installed. |
| Hosting | Compare effective cost, capability and maintenance across suitable providers. Cloudflare is a candidate, not a restriction. | API/frontend/database/email hosting. Compare the relevant services from providers such as Cloudflare, Vercel and Supabase; do not assume each offers equivalent runtime/database products. |
| First feature | Registration, login, authenticated caller read and current-session logout. | Exact contract must pass Step 1 review. Full SRS account lifecycle follows this initial slice. |

The backend stays in `backend/` with its current Nest 12/Express, npm, ESM/NodeNext and Vitest/Vite setup. Preserve the frontend, assets/license, root model references and PostgreSQL volume while designing this feature. Implementation belongs to the developer.

## Suggested branch

`feat/session-auth`

This uses `feat/` for a feature and a short kebab-case name. No additional repository-specific branch naming rule was found. The branch covers the first session-auth slice, its ORM persistence and meaningful tests, not the complete account/tenant platform.

The agent has not created or switched branches. From the repository root, the developer can run:

```powershell
git switch -c feat/session-auth
```

The checkout was on `dev` when this tracker was prepared, with earlier documentation edits still uncommitted. Review those edits and carry the intended documentation onto the feature branch; branch creation is not a commit or synchronization step.

## Development checkpoints

| Step | Status | Deliverable / completion evidence |
| --- | --- | --- |
| 1. Define the auth contract | CURRENT — awaiting developer decisions | Complete the worksheet below. Required outcomes, proposed API, state transitions, data invariants and security/failure checks agree. No unresolved choice changes the initial schema or browser trust boundary. |
| 2. Select the ORM and migration workflow | NOT STARTED | Choose one ORM with versions compatible with the existing Node/ESM/Nest/testing setup; prove migration and transaction behavior on an isolated PostgreSQL database. Keep reviewed migration SQL and tests alongside the backend. |
| 3. Establish persistence | NOT STARTED | Implement the agreed minimal schema, migration apply/status workflow, connection/shutdown handling and database readiness. Prove constraints and rollback without resetting the existing development volume. |
| 4. Implement the initial auth slice | NOT STARTED | Add registration, password verification, session creation/resolution and current-session logout. Verify the real Nest request pipeline and PostgreSQL behavior. Include boundary validation, safe responses, CSRF and abuse controls with their consumers. |
| 5. Verify browser behavior and failure cases | NOT STARTED | Confirm cookie issuance/sending/clearing, origin/CSRF rejection, expired/revoked sessions, concurrent registration, hash secrecy and transaction rollback. Reuse relevant backend checks and add meaningful CI coverage. A test client alone does not prove browser cookie policy. |
| 6. Review and close this tracker | NOT STARTED | Move accepted decisions and actual evidence to their owning documents; retain unfinished lifecycle/frontend work in the roadmap/register, repair incoming links and remove this temporary file when the slice is complete. |

## Step 1 — Define the session-auth contract

### Objective and output

Agree on observable behavior before choosing ORM models or generating feature files. Work in this document from the repository root. This step needs no package installation, Nest generator, migration, environment change or application-code edit.

Prerequisites: read [SRS authentication requirements](requirements/TenantFlow-SRS.md#51-authentication), [backend identity boundaries](requirements/BACKEND_REQUIREMENTS.md#1-boundaries-and-identity-ownership), and [engineering conventions](architecture/BACKEND_CONVENTIONS.md). Root `schemas.ts` and `enum.ts` are vocabulary references, not approved tables.

**Deliverable:** mark each item below reviewed, replace proposed values where needed, and explicitly record acceptance. Recommendations are not silently accepted decisions.

### 1A. Fix the slice boundary and account rules

- [ ] Confirm the first slice covers register -> login -> caller read -> logout. Email verification, recovery/password change, logout-all, session-management UI and renewal remain required follow-up work; they are not completed by this slice.
- [ ] Define email identity scope and canonicalization. Proposed: one global account per normalized email; trim surrounding email whitespace and apply one documented case policy consistently at registration/login and in database uniqueness. Do not strip plus tags or dots based on provider-specific assumptions.
- [ ] Define password input rules before selecting a hashing package. Proposed: accept long passphrases/spaces without composition rules, never silently trim or truncate, and bound input size. Select exact length/Unicode handling and common/compromised-password rejection policy. For password-only auth, use NIST's 15-character minimum as the starting recommendation; the exact project policy needs acceptance.
- [ ] Define account-state rules. Proposed: registration creates `pending_verification`; valid credentials may establish a restricted session that can read `/auth/me` and log out. Only `active` users receive normal business access. Inactive/frozen/deleted accounts cannot authenticate. Specify behavior when status changes during an existing session.
- [ ] Decide registration duplicate behavior. Proposed: the same generic HTTP 202 response for a valid new registration and an existing email, with no user ID, session or existence detail returned. A duplicate must not replace credentials or change the existing account. Database faults must still produce a real failure response. This does not promise that email delivery exists yet.

**Check:** walk through new email, case/whitespace variants, concurrent duplicates, incorrect password and each account state. A new user must not become fully activated by bypassing email verification. Pending verification support is a restricted intermediate state, not a verified account lifecycle.

### 1B. Specify session lifecycle

| Detail to review | Proposed baseline, not yet accepted |
| --- | --- |
| Credential | Generate 32 cryptographically random bytes and use an agreed transport-safe encoding. Do not use the user ID or a predictable database ID as the session secret. |
| Persistence | Store only a SHA-256 digest of the high-entropy session secret, plus metadata. Passwords use Argon2id through a maintained implementation instead; a fast session-secret digest is not password hashing. |
| Issuance | Successful login issues a new session; do not promote a caller-supplied anonymous/session ID into an authenticated session. Permit multiple device sessions initially. |
| Lifetime | Proposed starting values: 30-minute idle expiry and 24-hour absolute expiry, enforced by the server. These are project proposals, not values mandated by the cited standards. |
| Renewal | Define exactly which successful authenticated activity updates idle expiry and when it is persisted. Idle renewal cannot extend absolute expiry. Define stale/concurrent request behavior so renewal cannot undo revocation. Remember-me behavior is outside the first slice. |
| Verification | Resolve the secret digest, check expiry/revocation and current user eligibility on every authenticated request. Tenant membership/permissions remain separate checks. |
| Logout | Revoke the current persisted session, then clear the cookie with the same name/path/domain attributes. A repeated logout with a missing/already invalid session may return 204 and clear the cookie. Persistence failure must not be reported as successful revocation. |
| Failure | Missing/invalid/expired/revoked credentials produce 401 on a protected caller read; unavailable persistence produces a controlled server/service error, not a misleading 401. Secrets must never appear in logs or response bodies. |

- [ ] Accept or revise every baseline above, including renewal, concurrent logout and account-state change behavior.
- [ ] Define the session cleanup/retention policy. Expiry must deny access even before expired rows are cleaned up. Retention and physical cleanup scheduling can be implemented separately from request-time validity.

**Check:** draw login -> valid session -> idle renewal -> absolute expiry and login -> logout -> replay. Include two concurrent sessions and a request overlapping logout. No request may resurrect a revoked session or renew past its absolute deadline.

### 1C. Define browser transport and CSRF

- [ ] Choose topology. Proposed production target: one browser origin, with `/api` routed to Nest by the eventual hosting/proxy setup. Development may use frontend `localhost:3000` and API `localhost:14400`; these ports are different origins, so specify exact allowed origins and credentialed request behavior. Production routing is planned, not configured.
- [ ] Define production cookie attributes. Proposed: `__Host-tenantflow_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`; browser lifetime must not exceed server policy. The cookie is scoped to its host/path, not to a TCP port. Confirm this against the chosen deployment topology.
- [ ] Define an explicit local HTTP exception. Proposed: a separate unprefixed development cookie name, `HttpOnly`, `SameSite=Lax`, `Path=/`, host-only, with Secure disabled only for loopback HTTP development. Do not reuse that exception in deployment.
- [ ] Select a reviewed CSRF strategy for unsafe methods, including login/register/logout. Specify token/header delivery and any anonymous bootstrap when needed, allowed Origin behavior and rejection of missing/mismatched protection. SameSite and CORS alone do not establish a complete CSRF policy. Do not invent a custom cryptographic token scheme.
- [ ] Record browser request credentials, CORS/preflight behavior and safe cookie clearing. CORS must not reflect arbitrary origins or combine wildcard origins with credentials.

**Check:** the future browser test matrix covers successful credentialed calls, untrusted origins, missing/invalid CSRF protection and logout clearing. Add a browser check rather than relying solely on Supertest cookie behavior.

### 1D. Sketch the minimal persisted model

| Concept | Proposed fields / invariant to review |
| --- | --- |
| User | UUID, original/canonical email, status, verification timestamp, created/updated timestamps. Database uniqueness enforces the canonical identity policy under concurrent requests. |
| Password credential | User reference, encoded password hash including algorithm parameters, password-change timestamp. Decide separate one-to-one credentials versus fields on the user; one password credential per user. |
| Session | UUID, user reference, unique secret digest, created timestamp, last activity/idle deadline, absolute expiry and revocation timestamp. Match indexes to lookup and cleanup paths. Browser secret is never stored. |

- [ ] Sketch cardinalities, nullability, uniqueness, timestamp ownership and foreign-key deletion behavior. Registration writes must be atomic if credentials are separate records. Audit/history retention rules still apply.
- [ ] Keep global identity/session records distinct from future tenant memberships. An authentication session must not embed a permanent membership/role grant that stays valid after removal.
- [ ] Specify which session metadata is actually necessary. IP/user-agent/device values are optional candidates; do not collect or retain them indefinitely just because the reference model has fields.
- [ ] Defer verification/reset-token schema until its consuming lifecycle flow is designed. Record the future single-use/expiry/hash requirements without generating unused tables now.

**Check:** explain how uniqueness, rollback, session lookup/revocation and account deletion work using this sketch. Do not paste the entire root model into an ORM schema. Exact SQL/ORM mappings belong to Steps 2-3.

### 1E. Agree on HTTP contracts and the future test matrix

All routes/statuses below are proposals, not existing endpoints. Select an API prefix once; `/api` in the topology proposal is outside the route paths shown here.

| Method / route | Proposed contract |
| --- | --- |
| `POST /auth/register` | Valid email/password -> generic 202 with no auto-login; invalid DTO -> 400; duplicate valid email -> same generic 202. New-account writes are atomic. |
| `POST /auth/login` | Valid eligible credentials -> 200 with safe user DTO and session cookie; invalid credentials/ineligible account -> generic 401. A pending user receives only the explicitly restricted session capabilities. |
| `GET /auth/me` | Valid session -> 200 with only `id`, allowed email field, `status` and verification state; missing/invalid/expired/revoked -> 401. No password hash, session digest or provider metadata. |
| `POST /auth/logout` | Revoke current session and clear cookie -> 204; missing/already invalid session -> idempotent 204; valid-session persistence failure -> controlled server/service error. CSRF rules still apply. |

- [ ] Choose one error schema and classify validation, authentication, CSRF, throttling and database failure without leaking internal diagnostics. Specify credential failures without account-enumeration details; generic responses alone do not guarantee equivalent timing.
- [ ] Define registration/login abuse limits and how the API determines client IP behind a future trusted proxy. Exact thresholds/store/package are a follow-up implementation choice before exposing the routes publicly, not an implicit Redis requirement.
- [ ] List acceptance cases: duplicate/concurrent registration; invalid password; account states; safe response fields; cookie settings; session expiry/renewal/revocation; repeated logout; failed persistence; CSRF rejection; missing/invalid input; log redaction. Add later browser and real-PostgreSQL checks to the relevant step rather than treating this list as tests already run.

**Step 1 exit:** a reviewed contract, state-flow sketch, minimal entity sketch and acceptance matrix with every schema/security-affecting choice resolved. Record chosen values here and preserve durable decisions in backend requirements. Then select the ORM in Step 2. Generators and installation commands are deliberately not part of Step 1.

## Follow-up boundaries and handoff

The first slice is not the full authentication milestone. Email delivery/verification, recovery/password change, logout-all, session management, renewal hardening and frontend Stack Auth replacement remain visible in the [roadmap](planning/ROADMAP.md) and [validation register](planning/VALIDATION.md). Do not publish a pending-verification prototype as full SRS authentication. Organization isolation/RBAC, billing and other business features retain their existing sequence.

Keep current runtime commands/configuration in the [backend README](../backend/README.md). Keep review findings in the conversation; this file tracks development work rather than duplicating review reports. On completion, preserve accepted decisions/evidence in their owning documents and retire this file with its incoming links.

## Research and verification limits

Step 1 security guidance was checked on 22 October 2026 against [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), and [NIST SP 800-63B password guidance](https://pages.nist.gov/800-63-4/sp800-63b.html). These support the design considerations; proposed endpoint names and timeout values are project choices. This is not a claim of standards compliance or a verified implementation.

The existing backend has no ORM dependency or auth/session integration. Only documentation was edited for this tracker; no application code/configuration, dependencies, migrations or frontend integration changed, and no branch/index/history mutations were performed. Documentation checks do not establish application behavior. ORM/version-specific framework research and reproducible compatibility checks belong to Step 2 before recommending its installation/API usage.

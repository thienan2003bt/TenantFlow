# Session authentication development plan

**Current checkpoint: isolated PostgreSQL migration verification.** The first-slice contract, three mappings and generated InitialAuth migration are registered on `feat/auth-persistence`. Offline review and local checks cover source/configuration; applying/reverting the migration and actual constraints still need evidence. Password hashing/verification exists; auth handlers remain unimplemented.

[Documentation index](README.md) · [Roadmap](planning/ROADMAP.md#current-priorities-and-learning-preferences) · [Accepted contract](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) · [Validation register](planning/VALIDATION.md#open-follow-ups)

## Scope and current state

The first slice covers registration, login, authenticated caller read and current-session logout. The developer accepted the baseline on 25 October 2026 and delegated remaining policy decisions on 12 November 2026. The [backend requirements](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) now own the complete first-slice contract, including the exact [minimal persistence mapping](requirements/BACKEND_REQUIREMENTS.md#minimal-auth-persistence-mapping). There are no remaining Step 1 policy proposals in this tracker.

[ADR 0001](architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) selects Nest/Express, TypeORM repositories with PostgreSQL, reviewed migrations, opaque database sessions and Argon2id. Runtime database wiring, a compiled CLI DataSource, `AuthModule` and `PasswordService` exist. The branch review passed static/password/HTTP-smoke/hook checks; the developer subsequently reported successful migration-status execution. These results do not establish feature migrations or account/session behavior. See the validation register for provenance and limits.

Keep implementation in `backend/`, preserve the frontend/assets/license and PostgreSQL volume, and use the [backend README](../backend/README.md) for runtime commands. The developer writes backend behavior and runs generators/migrations.

## Development checkpoints

| Step | State | Completion evidence |
| --- | --- | --- |
| 1. Define the auth contract | DONE — design finalized, not runtime-verified | Remaining decisions were resolved on 12 November 2026 in backend requirements. Preserve the explicitly accepted 6-128-code-point password policy and its security distinction. |
| 2. Validate TypeORM integration and migration workflow | Basic CLI connectivity user-reported; remaining runtime checks open | Runtime/CLI wiring exists and migration-status execution succeeded per the developer. Nest compiled startup, health/shutdown and isolated migration/transaction checks need their own recorded evidence. |
| 3. Establish persistence | IN PROGRESS — initial migration generated/registered; execution verification pending | InitialAuth SQL covers the three mappings, constraints, restrictive FKs and session user index. Use the named migration scripts for isolated PostgreSQL apply/revert/reapply and essential constraint/rollback checks. Preserve the development volume. |
| 4. Implement the initial auth slice | IN PROGRESS — password primitive only | Password hashing/verification and tests pass, including formatting in the branch review. Registration, sessions, caller read and logout remain unimplemented. Introduce boundary validation, safe responses, CSRF and abuse controls with those flows. |
| 5. Verify browser behavior and failure cases | NOT STARTED | Verify cookie issuance/renewal/sending/clearing, origin/CSRF denial, expiry/revocation, concurrent registration/logout, account status changes, hash secrecy and rollback. Add meaningful CI coverage with each consuming checkpoint. |
| 6. Close this tracker | NOT STARTED | Preserve decisions/evidence and unfinished follow-ups in their owning documents; repair incoming links and remove this temporary file after the slice is complete. |

## Contract handoff

Use backend requirements as the single policy source. The design now fixes email case/length, password Unicode/blocklist/input bounds, browser trust, exact entity fields, timestamps/deletion, renewal/retention, safe responses and local abuse limits. Later verification/recovery, frontend replacement and production proxy configuration retain explicit follow-ups.

### Completed checkpoint — three entity files

- **Objective:** represent the accepted global identity state without adding HTTP behavior yet.
- **Action:** all three mappings and shared runtime/CLI registrations are implemented. The two new files were normalized to LF, and the formatter's LF policy is explicit. No entity behavior changed during this formatting fix.
- **Working directory:** `backend/`. `npm.cmd run check` passed typecheck, lint, formatting, unit/HTTP/hook tests and Nest build in one run. Continue using it after changes. The script does not run migrations or real database integration; provenance and limits are recorded in the validation register.
- **Check:** review names/types/nullability, primary/unique/foreign keys, CHECK constraints, timestamp ownership, restrictive deletion and secret-selection behavior. Runtime and CLI must use the same registrations, with synchronization and startup migrations disabled. A successful build is not proof that PostgreSQL constraints work.

### Subsequent checkpoint — migration and real PostgreSQL

Work minimum-first under the developer's 24 November 2026 preference: InitialAuth is generated and registered, and its up/down SQL has been inspected. The immediate action is isolated database apply/revert/reapply and essential constraint checks using the [named package scripts](../backend/README.md#initial-auth-migration-next-developer-checkpoint). No new endpoint, service, test framework or CI expansion is needed for this checkpoint.

Migration scripts rebuild automatically and load the shared compiled DataSource with backend environment configuration. Use an isolated database before applying/reverting migrations or exercising cleanup. Verify the requirements' essential constraint and transaction-rollback cases, keeping normal development data intact; local manual evidence can establish this first checkpoint before broader automation. Then implement registration as the first workable account operation with its required input/hash/transaction/duplicate-response and abuse/CSRF controls. Add database automation and backend CI incrementally; isolated test-database lifecycle automation remains later work.

## Follow-up boundaries and handoff

The initial slice does not complete SRS authentication. Verification/email delivery, recovery/password change, logout-all, session management, public-deployment hardening and frontend Stack Auth replacement remain in the [roadmap](planning/ROADMAP.md) and [validation register](planning/VALIDATION.md). A pending-verification prototype does not establish full activation. Internationalized-email input is deferred; ASCII punycode domains remain supported by the initial policy. Organization isolation/RBAC and other business features retain their roadmap sequence.

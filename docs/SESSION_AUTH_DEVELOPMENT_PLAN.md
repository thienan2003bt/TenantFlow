# Session authentication development plan

**Current checkpoint: minimal auth entity review.** The first-slice contract is finalized. User is implemented as the requested example on `feat/auth-persistence`; the developer implements PasswordCredential and Session next. Password hashing/verification and their tests exist. Feature migrations and auth handlers remain unimplemented.

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
| 3. Establish persistence | IN PROGRESS — User mapped; two entities pending | User and its shared runtime/CLI registration exist. Review all three mappings before the migration and real PostgreSQL tests for constraints, concurrent uniqueness, apply/revert/reapply and rollback. Preserve the development volume. |
| 4. Implement the initial auth slice | IN PROGRESS — password primitive only | Password hashing/verification and tests pass, including formatting in the branch review. Registration, sessions, caller read and logout remain unimplemented. Introduce boundary validation, safe responses, CSRF and abuse controls with those flows. |
| 5. Verify browser behavior and failure cases | NOT STARTED | Verify cookie issuance/renewal/sending/clearing, origin/CSRF denial, expiry/revocation, concurrent registration/logout, account status changes, hash secrecy and rollback. Add meaningful CI coverage with each consuming checkpoint. |
| 6. Close this tracker | NOT STARTED | Preserve decisions/evidence and unfinished follow-ups in their owning documents; repair incoming links and remove this temporary file after the slice is complete. |

## Contract handoff

Use backend requirements as the single policy source. The design now fixes email case/length, password Unicode/blocklist/input bounds, browser trust, exact entity fields, timestamps/deletion, renewal/retention, safe responses and local abuse limits. Later verification/recovery, frontend replacement and production proxy configuration retain explicit follow-ups.

### Next checkpoint — three entity files

- **Objective:** represent the accepted global identity state without adding HTTP behavior yet.
- **Action:** use the implemented `backend/src/auth/user.entity.ts` as the TypeORM example, then implement `password-credential.entity.ts` and `session.entity.ts` using the canonical mapping table. Keep all three files directly in `src/auth/` and extend the existing shared runtime/CLI entity registration. Retain `AuthModule`; no new controller/service generator is needed for entity files.
- **Working directory:** `backend/`. After editing, run the existing `npm.cmd run typecheck`, `npm.cmd run lint` and `npm.cmd run format:check` commands. Run `npm.cmd run build` to check the Nest ESM output. These are future checks for the developer's new mappings, not results of the contract update.
- **Check:** review names/types/nullability, primary/unique/foreign keys, CHECK constraints, timestamp ownership, restrictive deletion and secret-selection behavior. Runtime and CLI must use the same registrations, with synchronization and startup migrations disabled. A successful build is not proof that PostgreSQL constraints work.

### Subsequent checkpoint — migration and real PostgreSQL

After entity review, the developer generates and reviews the first migration using the compiled DataSource workflow in the backend README. Add an isolated test target before applying/reverting migrations or exercising cleanup. Verify the requirements' mapping acceptance cases and transaction rollback; keep normal development data intact. Add backend CI for locked install/static/unit/HTTP/hook/build and the new integration tests. The integration script and test-database lifecycle are implementation work, not existing commands.

## Follow-up boundaries and handoff

The initial slice does not complete SRS authentication. Verification/email delivery, recovery/password change, logout-all, session management, public-deployment hardening and frontend Stack Auth replacement remain in the [roadmap](planning/ROADMAP.md) and [validation register](planning/VALIDATION.md). A pending-verification prototype does not establish full activation. Internationalized-email input is deferred; ASCII punycode domains remain supported by the initial policy. Organization isolation/RBAC and other business features retain their roadmap sequence.

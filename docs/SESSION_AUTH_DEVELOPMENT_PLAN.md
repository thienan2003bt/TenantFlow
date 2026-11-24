# Session authentication development plan

**Current checkpoint: registration HTTP boundary on `feat/auth-registration`.** PR #11 merged the persistence foundation. The developer reports passing isolated migration, constraint, concurrency and rollback checks and completing scratch cleanup. The shared parser now passes its 72-case suite and the full backend check under the revised password policy. The pinned blocklist also passes unit and compiled-asset checks; RegistrationService now passes unit and real PostgreSQL completion checks; auth HTTP handlers remain unimplemented. The detailed registration PR plan stays in the chat; the requested database-automation TODO is retained in the validation register.

[Documentation index](README.md) · [Roadmap](planning/ROADMAP.md#current-priorities-and-learning-preferences) · [Accepted contract](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) · [Validation register](planning/VALIDATION.md#open-follow-ups)

## Scope and current state

The first slice covers registration, login, authenticated caller read and current-session logout. The developer accepted the baseline on 25 October 2026 and delegated remaining policy decisions on 12 November 2026. The [backend requirements](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) now own the complete first-slice contract, including the exact [minimal persistence mapping](requirements/BACKEND_REQUIREMENTS.md#minimal-auth-persistence-mapping). There are no remaining Step 1 policy proposals in this tracker.

[ADR 0001](architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) selects Nest/Express, TypeORM repositories with PostgreSQL, reviewed migrations, opaque database sessions and Argon2id. Runtime database wiring, a compiled CLI DataSource, `AuthModule` and `PasswordService` exist. The branch review passed static/password/HTTP-smoke/hook checks; the developer subsequently reported successful migration-status execution. The subsequent manual schema checks are developer-reported in the validation register; neither those checks nor the earlier local suites establish account/session HTTP behavior. See the validation register for provenance and limits.

Keep implementation in `backend/`, preserve the frontend/assets/license and PostgreSQL volume, and use the [backend README](../backend/README.md) for runtime commands. The developer writes backend behavior and runs generators/migrations.

## Development checkpoints

| Step | State | Completion evidence |
| --- | --- | --- |
| 1. Define the auth contract | DONE — design finalized, not runtime-verified | The accepted contract owns policy. On 24 November 2026 the developer changed passwords to 8-128 Unicode code points plus required character classes, retaining the maximum and Unicode safeguards; preserve its security distinction. |
| 2. Validate TypeORM integration and migration workflow | Basic CLI connectivity user-reported; remaining runtime checks open | Runtime/CLI wiring exists and migration-status execution succeeded per the developer. Nest compiled startup and health/shutdown remain unverified; isolated migration/registration transaction results are now recorded in the validation register. |
| 3. Establish persistence | Migration/registration integration tests pass; broader schema automation pending | Manual schema checks are developer-reported. Ten agent-run isolated PostgreSQL cases now prove apply/revert/reapply, registration defaults/hash, rollback and overlapping duplicates, with test-container cleanup. Continue F-07 without using the development volume. |
| 4. Implement the initial auth slice | IN PROGRESS — registration service verified | F-08, blocklist and registration persistence checks pass; implement the registration HTTP boundary with boundary validation, safe responses, CSRF and abuse controls. Sessions, caller read and logout remain later increments. |
| 5. Verify browser behavior and failure cases | NOT STARTED | Verify cookie issuance/renewal/sending/clearing, origin/CSRF denial, expiry/revocation, concurrent registration/logout, account status changes, hash secrecy and rollback. Add meaningful CI coverage with each consuming checkpoint. |
| 6. Close this tracker | NOT STARTED | Preserve decisions/evidence and unfinished follow-ups in their owning documents; repair incoming links and remove this temporary file after the slice is complete. |

## Contract handoff

Use backend requirements as the single policy source. The design now fixes email case/length, password composition/Unicode/blocklist/input bounds, browser trust, exact entity fields, timestamps/deletion, renewal/retention, safe responses and local abuse limits. Later verification/recovery, frontend replacement and production proxy configuration retain explicit follow-ups.

### Completed checkpoint — three entity files

- **Objective:** represent the accepted global identity state without adding HTTP behavior yet.
- **Action:** all three mappings and shared runtime/CLI registrations are implemented. The two new files were normalized to LF, and the formatter's LF policy is explicit. No entity behavior changed during this formatting fix.
- **Working directory:** `backend/`. `npm.cmd run check` passed typecheck, lint, formatting, unit/HTTP/hook tests and Nest build in one run. Continue using it after changes. The script does not run migrations or real database integration; provenance and limits are recorded in the validation register.
- **Check:** review names/types/nullability, primary/unique/foreign keys, CHECK constraints, timestamp ownership, restrictive deletion and secret-selection behavior. Runtime and CLI must use the same registrations, with synchronization and startup migrations disabled. A successful build is not proof that PostgreSQL constraints work.

### Current handoff — registration and repeatable database checks

The developer reports completing the manual isolated-schema checkpoint described in the [migration guide](../backend/src/database/migrations/README.md). Its evidence and limits belong in the validation register. The shared parser is corrected and its checks pass. The pinned blocklist is implemented and verified. Transactional registration now passes unit and isolated PostgreSQL tests. Add its HTTP boundary with generic accepted responses, safe errors and required abuse/CSRF/input controls.

At the developer's request, [F-07](planning/VALIDATION.md#automated-postgresql-integration-testing--todo) now tracks a focused real-PostgreSQL integration suite, including isolated lifecycle and cleanup. Deliver it incrementally with registration. The dedicated test:db command and Docker CLI harness now pass migration/registration integration checks. Remaining schema/HTTP coverage and hosted CI results are still pending. Keep the detailed PR working plan in the chat rather than duplicating it here.

## Follow-up boundaries and handoff

The initial slice does not complete SRS authentication. Verification/email delivery, recovery/password change, logout-all, session management, public-deployment hardening and frontend Stack Auth replacement remain in the [roadmap](planning/ROADMAP.md) and [validation register](planning/VALIDATION.md). A pending-verification prototype does not establish full activation. Internationalized-email input is deferred; ASCII punycode domains remain supported by the initial policy. Organization isolation/RBAC and other business features retain their roadmap sequence.

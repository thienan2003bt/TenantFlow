# Validation and follow-ups

[Documentation index](../README.md) · [Implementation roadmap](ROADMAP.md)

This register owns observed verification results, their limits and open checks. Dated results are historical evidence, not checks rerun against the current working tree. Use the [backend README](../../backend/README.md) for commands and the roadmap for sequencing.

## Recorded foundation checks

### Backend foundation — 23 October 2026

| Check | Recorded result | Boundary |
| --- | --- | --- |
| Static/build checks | Typecheck, ESLint, formatting and Nest build passed. | Does not establish real database or auth behavior. |
| Unit and HTTP tests | 14 unit tests and one HTTP smoke test passed, covering configuration/database validation and Hello World. | The HTTP suite stubs the DataSource and checks GET /; it does not cover health HTTP behavior, PostgreSQL or auth. |
| Compiled CLI loading | The installed TypeORM loader loaded the compiled DataSource with synthetic database-only settings; it remained uninitialized. | No database connection or feature migration was executed. |
| Application startup | Compiled/watch startup and HTTP health smoke have earlier recorded evidence. | Real application/CLI PostgreSQL startup and connection cleanup remain unverified. Docker was unavailable and no local listener was reachable on port 5432 during the database review. |

Next database checks: verify PostgreSQL container health, SQL execution and Windows client access using the [PostgreSQL guide](../setup/POSTGRESQL_SETUP.md), then confirm backend environment settings and verify compiled startup, migration status and shutdown using the backend README. Configuration tests do not substitute for these checks.

On 25 October 2026 the developer reported successful Docker Client/Server, Compose and Linux-engine checks after setup. This is user-reported readiness, not an agent-executed Docker check. PostgreSQL startup, SQL/client access and the Nest connection remain pending; pgAdmin is an optional local client.

### Password service — 25 October 2026

The developer implemented `AuthModule` and `PasswordService` and installed `argon2`. The requested testing work replaced the generated construction-only test with seven real-Argon2 cases and added two injected-library-failure cases. The service implementation was left unchanged during review.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Typecheck and ESLint | Passed after adding the tests. | These do not establish account/session behavior. |
| Unit tests with V8 coverage | All 23 tests passed. Password cases cover encoded algorithm/work factors, correct/incorrect passwords, independent salts, spaces, Unicode, persisted work factors, malformed hashes and preserved library errors. | Valid hashing/verification cases use real Argon2; the two library-failure cases use isolated mocks. |
| Password-service coverage | Coverage JSON records all 11 statements and three functions hit; the scoped report has 100% line/statement/function coverage. | There are zero instrumented branches in this service. Coverage does not prove security or full auth behavior. Reports are generated under ignored `backend/coverage/`. |
| HTTP smoke | One test passed. | The DataSource remains stubbed; this checks app/module assembly and GET /, not PostgreSQL or auth endpoints. |
| Hook-runner tests | Seven tests passed. | Runner path/failure behavior only; no Git index/configuration changes or actual commit. |
| Nest build and compiled Node ESM smoke | Build passed; importing the compiled service, hashing with real Argon2 and verifying match/mismatch passed. | Service execution only; this does not start the database-dependent Nest application. |
| Formatting | `npm.cmd run format:check` failed on `src/auth/password.service.ts`. The test files were formatted. | Historical failure; superseded by the successful 12 November branch-review formatting check below. No automatic service fix was made in that review. |

The current local hashing profile is Argon2id, 64 MiB, two iterations and parallelism one. Deployment-runtime benchmarking, registration/credential persistence, browser/session behavior and real database integration remain later checkpoints.

### Foundation branch review and contract handoff — 12 November 2026

- Before PR #10 merged, the agent reran typecheck, ESLint, formatting, 23 unit tests, one database-stubbed HTTP test, seven hook-runner tests and branch whitespace checks successfully. Build/compiled startup were not rerun in that review. Docker inspection failed because the daemon was unreachable; this was not a successful PostgreSQL check.
- The developer subsequently reported that `node --env-file=.env ./node_modules/typeorm/cli.js migration:show -d ./dist/database/data-source.js` completed without error after correcting the path. This is user-reported CLI database connectivity, not agent-executed evidence. No feature migrations were registered; it does not establish migration apply/revert, transaction behavior, Nest startup/health/shutdown or browser authentication.
- Local `dev` at `565b2d5` contains the foundation merge from PR #10. At the developer's explicit request, the agent created and checked out `feat/auth-persistence` from that clean local base. No fetch, commit, push or publication was performed.
- The developer delegated first-slice contract decisions. Backend requirements now own finalized policies and the exact three-entity mapping; the temporary plan owns implementation checkpoints. Design completion does not establish runtime correctness. Entity files, feature migrations and auth routes were not added in this documentation batch.

### User entity example — 12 November 2026

At the developer's explicit request, the agent implemented User as the first TypeORM mapping, added the backend-local UserStatus enum and registered User in the shared runtime/CLI database options. PasswordCredential/Session, migrations and repository consumers were not added.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Typecheck, ESLint, formatting and Nest build | Passed. | The compiled enum alias resolves to a relative JavaScript import. No dependency/configuration/module-system change was required. |
| Existing unit/HTTP suites | 23 unit tests and one database-stubbed HTTP test passed. | These existing suites do not exercise User persistence or PostgreSQL constraints. |
| Compiled Node ESM and offline ORM smoke | Passed after accounting for TypeORM's timestamp-default normalization in the diagnostic assertion. The compiled shared options build valid metadata for eight columns, six CHECKs and canonical-email uniqueness, and render PostgreSQL CREATE TABLE SQL with the C collation. The initial assertion expected literal CURRENT_TIMESTAMP(3), whereas the driver renders its equivalent normalized expression. | Uses synthetic configuration and no database connection. No CREATE TABLE SQL was executed; this is not migration or constraint-enforcement evidence. |

Next evidence: review the two remaining entity mappings, then apply/revert/reapply a reviewed migration and exercise constraints/rollback against isolated real PostgreSQL. User alone is a mapping checkpoint, not working account persistence.

Documentation checks for this batch resolved 154 local links and 35 anchors across 18 tracked Markdown files. Whitespace/final-newline checks passed, including the two new source files. No migration or database command was executed for this entity example.

### Three-entity re-review and combined check — 12 November 2026

The developer corrected PasswordCredential and Session and registered both alongside User. Review found the requested restrictive foreign keys, credential primary-key ownership, mandatory session activity/expiry timestamps, finite-time/digest/nonempty-hash CHECKs, hidden hash/digest selections and session user index. No further correctness finding was identified in this mapping scope. The entity files were left unchanged during re-review.

| Check | Observed result | Boundary |
| --- | --- | --- |
| `npm.cmd run check` | Newly added sequential command passed typecheck/lint, then stopped with failure at format:check on both new entity files. | The command fails on the first unsuccessful step and applies no fixes. Comparison with Prettier output showed line-ending differences only; the developer must run format and rerun check. No successful full-pipeline result is claimed. |
| Separate unit/HTTP/hook/build checks | 23 unit tests, one database-stubbed HTTP test, seven hook-runner tests and Nest build passed when run individually. | Initial sandbox attempts hit temporary-cache EPERM and loopback EACCES. Unit tests passed using an ignored workspace-local temporary directory; the HTTP test passed outside the sandbox. No test/runtime configuration was changed to hide those restrictions. |
| Compiled offline ORM review | Shared options loaded all three entities. Each dependent entity has one user FK with RESTRICT on delete/update; the credential uses user_id as its primary key, the session user index exists, and hash/digest are absent from default SELECT projections. Metadata/DDL rendering checks passed. | Synthetic database settings; no connection, migration or SQL execution. Actual PostgreSQL enforcement and concurrency remain pending. |

Next checkpoint: format the two new files and rerun the combined command, then review and exercise the first migration on isolated PostgreSQL. The check script deliberately excludes migration/database/browser operations.

### Entity line-ending normalization — 12 November 2026

The developer requested a direct fix after committing the mappings. Both entity files had CRLF in the working copy even though their index versions and existing backend Git attributes specified LF. Prettier comparison confirmed line-ending differences only. The files were formatted to LF and `endOfLine: "lf"` was made explicit in backend Prettier configuration; no entity behavior changed. The earlier formatting failure above is historical and resolved.

`npm.cmd run check` then passed in one run: typecheck, ESLint, format verification, 23 unit tests, one database-stubbed HTTP test, seven hook-runner tests and Nest build. This run used unsandboxed execution so the HTTP smoke test could access its local loopback server; no runtime/test workaround was committed. Git inspection confirmed both working files now use LF. No PostgreSQL connection, migration, constraint/concurrency test or browser-auth check was executed.

The local mapping increment is complete. The next evidence remains a reviewed migration and isolated PostgreSQL apply/revert/reapply, constraint and rollback checks.

### Initial auth migration and package commands — 24 November 2026

The developer reported successful migration generation and supplied `1795512053650-InitialAuth.ts`. Source review found up() creates users, password_credentials and sessions, adds the session user index and both restrictive user FKs; down() removes those constraints/index/tables in dependency order. Generation is not application evidence. The agent formatted the generated file, registered its class in shared runtime/CLI options and added explicit db:migration:generate/show/run/revert package scripts. The small Node wrapper owns environment/DataSource/output paths and forwards argument arrays without a shell. Database operations remain developer actions.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Complete `npm.cmd run check` | Typecheck, lint, formatting, 23 unit tests, one database-stubbed HTTP test, seven hook tests and Nest build passed. | Uses unsandboxed execution for the HTTP loopback test. These checks do not connect to PostgreSQL or apply/revert the migration. |
| npm argument forwarding/help | `npm.cmd run db:migration:generate -- --help` rebuilt and displayed wrapper usage successfully. | No generation or database connection. |
| Wrapper diagnostics | 15 in-memory cases passed for valid command routing, fixed generation directory, invalid/missing/extra arguments, traversal rejection, help and child/spawn-error exit propagation. | Child process execution was replaced by a stub; no TypeORM/database operation ran. These diagnostics are not a new committed test suite. |
| Compiled DataSource/migration loading | Three entities and InitialAuth loaded with synthetic settings. A query recorder observed six up and six down statements, including the two RESTRICT/RESTRICT foreign keys. | No DataSource initialization or SQL execution; this verifies discovery and statement assembly only. |

Next checkpoint: use the named scripts to establish migration apply/revert/reapply and essential constraint/rollback evidence on an isolated PostgreSQL database, then proceed to minimal registration. No hosted CI or browser/auth result is established by this batch.

### Manual isolated auth schema checks — 24 November 2026

On `feat/auth-registration`, the developer reported passing the guided checks against the separate `tenantflow-auth-check` PostgreSQL 17 container/database on port 55432: InitialAuth apply/revert/reapply; table discovery; canonical-email uniqueness; failed credential insertion and full transaction rollback; credential primary-key/foreign-key restrictions; account status/timestamp rules; overlapping email inserts using two connections; email consistency; session digest, lifecycle, revocation, finite-time and foreign-key checks. The developer also reported fixture cleanup, scratch-container/anonymous-storage removal and closing the dedicated environment-override shells.

These are user-reported manual results, not agent-executed or automated evidence. Raw SQL transaction checks prove database behavior, not that a future registration service uses a shared transaction correctly. Nest startup/shutdown, actual registration/login/session behavior, browser behavior and hosted CI remain separate checks. F-07 tracks repeatable automation.

### Auth input parser and password-policy revision — 24 November 2026

The developer supplied `src/auth/auth-input.ts` and `src/errors/auth-input.error.ts`, then requested a detailed unit suite and documentation reconciliation. The revised password contract requires 8-128 Unicode code points plus lowercase/uppercase ASCII letters, an ASCII digit and an isStrongPassword-recognized symbol. The developer explicitly retained the maximum and Unicode safeguards. The parser implementation is left unchanged in this testing/documentation batch.

The suite uses the real installed class-validator implementation without a Nest application, database or password hashing. It covers object shape/types, email identity and boundaries, composition, code-point bounds, malformed Unicode, exact password preservation, result immutability and safe validation errors. Assertions for outstanding requirements remain active; failures are implementation findings, not skipped or expected-failure tests. The agent ran the backend scripts individually so the failed unit/format checks did not prevent observing the other results; this was not a successful combined `npm.cmd run check` run. F-08 owns remaining parser corrections.

| Check | Observed result | Boundary |
| --- | --- | --- |
| New auth input suite | 72 tests: 58 passed, 14 failed. | Real installed validator; no mocks, database or HTTP server. Tests for outstanding requirements remain active. |
| Full unit suite | 95 tests: 81 passed, 14 failed; all failures belong to auth-input.spec.ts. | Existing 23 unit cases remain passing. |
| Typecheck, ESLint and Nest build | Passed. | Static/compiled checks do not establish parser contract correctness. |
| Formatting | Failed on the developer's unchanged auth-input.ts and errors/auth-input.error.ts; the new spec passed. | The agent did not reformat or change either implementation file. |
| Existing HTTP smoke and hook suites | One database-stubbed HTTP test and seven hook tests passed. | No PostgreSQL, registration HTTP or browser check was executed. |

The 14 failing cases comprise unknown fields (3), array-shaped input with named fields (1), inherited credentials (1), email trimming (2), quoted/Unicode-domain email (2), overlength passwords (2), UTF-16/code-point minimum disagreement (1) and unpaired surrogates (2). That failed run is historical; the fixes and successful combined check below supersede its blocked status. No Git staging, commit, database operation or publication was performed.


### Auth input parser fixes — 24 November 2026

At the developer's explicit request, the agent fixed the parser directly and formatted it and AuthInputError. It now accepts unknown input safely, requires exactly two own credential fields, trims email before validation/display storage, excludes quoted/non-ASCII mailbox input, enforces well-formed 8-128-code-point passwords before the configured composition check, and preserves accepted password strings exactly. No tests were weakened, skipped or marked as expected failures.

The agent ran `npm.cmd run check` successfully in one sequence: typecheck, ESLint, formatting, all 95 unit tests (including all 72 auth-input cases), one database-stubbed HTTP smoke test, seven hook tests and Nest build. F-08 is complete. The next checkpoint is the pinned blocklist. No PostgreSQL, actual registration/session HTTP or browser check ran; F-07 remains pending.

The developer also authorized directly applying identified fixes in future task scope, using only environment-required tool approvals. Root/backend agent instructions and engineering guidance now record that preference. Existing Git staging was preserved; edited files require restaging by the developer. No commit, publication, database operation, dependency or runtime configuration change was performed.

### Pinned password blocklist and compiled assets — 24 November 2026

The developer supplied the service scaffold and AuthModule registration. Review found that assertAllowed() replaced the list with an empty array on every call and that the generated test checked construction only. At the developer's standing fix authorization, the agent replaced that reset path with one-time constructor loading and exact Set membership, removed the public mutable reload operation, added checksum verification and preserved operational failures separately from blocked-password AuthInputError.

The vendored SecLists snapshot is pinned to commit `fcde9140df969b1e4d7bb056122646dace4ed4cc`. Its exact 73,026 UTF-8/LF bytes were verified against Git blob `a93ea7f91f095b38728795ecd6ec731e59b8c112` and SHA-256 `68782d6a4a19a4768d5f15dd66bd534e7a33055cc755411e33f16d18c50fdcce`. The upstream filename says 10k, but there are 10,001 unique nonempty entries. Three separately maintained common/context-specific examples bring the loaded total to 10,004; they are not individually certified breach records. The same-commit MIT license and metadata/update procedure are bundled. Monthly review is next due 24 December 2026.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Complete `npm.cmd run check` | Passed typecheck, lint, formatting, all 119 unit tests, one HTTP smoke, seven hook tests, build and the compiled blocklist smoke. | No PostgreSQL or registration/session browser flow executed. |
| Blocklist unit suites | 24 cases passed, including exact checks of every upstream/additional entry, composition-compliant blocked input, permitted case/space/substring/Unicode variants, repeated calls, metadata/license identity, safe errors and injected missing/unreadable/corrupt/empty files. | Normal behavior uses the real assets. Operational-failure tests mock filesystem reads only. |
| Startup and per-check I/O | Nest provider construction rejects unavailable data; construction reads two assets and subsequent password checks perform no file reads. | Verifies provider/module behavior, not assembled Nest/PostgreSQL startup. |
| Nest build packaging | All five source assets match their copied dist counterparts byte-for-byte. The compiled service passes blocked/permitted checks after changing cwd to the system temporary directory. | Standalone compiled provider only; no server or database started. |

The build smoke is now part of the existing check pipeline. `npm.cmd run test:blocklist:build` rebuilds and runs it separately. No dependency, Git index, commit, database or publication operation was performed. The blocklist checkpoint is complete; invoke it from the future registration service before hashing and the atomic transaction. F-07 still owns real PostgreSQL integration testing.

### Registration service review and PostgreSQL completion checks — 24 November 2026

The developer staged RegistrationService, its generated spec, module wiring and parseAuthInput JSDoc. The agent fixed the browser-only TypeORM import, added explicit Nest injection tokens, removed raw database-error logging, and implemented duplicate acceptance only after the transaction rejects for QueryFailedError/code 23505/constraint uq_users_email_canonical/table users. Other failures retain their identity. Both inserts continue through one transaction manager after parsing, blocklist checking and hashing. The redundant parsed-input cast was removed. The register() JSDoc now explains atomicity, accepted duplicates and failure propagation in two sentences; the developer's separate parseAuthInput JSDoc remains unchanged.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Complete npm.cmd run check | Passed typecheck, lint, formatting, 137 unit tests, one database-stubbed HTTP smoke, seven hook tests, Nest build and compiled blocklist smoke. | No registration HTTP endpoint exists yet. |
| Registration unit suite | 18 cases passed for DI, normalized identity, same-manager inserts, hash-before-transaction ordering, invalid/blocked/operational/hash failures, precise duplicate classification, unrelated failures, credential-write failure and no raw console logging. | Dependency stubs verify orchestration; real rollback is established separately below. |
| npm.cmd run test:db | All ten cases passed against an owned disposable PostgreSQL 17 container. Actual migrations apply/revert/reapply; account defaults and a real Argon2 hash verify; no session is created; duplicates preserve status/credentials across all five states; a test-only credential trigger forces complete rollback; overlapping registrations on separate connections both resolve with one winning credential; unavailable persistence rejects. | Uses the actual RegistrationService and registered migrations. Account/session HTTP, browser behavior and comprehensive schema automation remain pending. |
| Concurrency coordination | The first transaction is held at credential insertion by a test-only advisory-lock trigger. The second is observed waiting on the unique conflict before the first is released; the winning password is verified afterward. | Proves transaction overlap rather than merely scheduling Promise.all(). Test triggers are removed in finally blocks and never enter application migrations. |
| Harness failure and cleanup | The first database run exposed a varchar/text ambiguity in the test fixture's state-update query. Explicit casts corrected it; the second run passed all ten tests. Both runs removed their uniquely labelled containers and tmpfs test storage. A final Docker query found no remaining registration-test containers. | No existing development database/volume was used. No new dependency or hosted CI run was introduced. |

The test runner invokes installed Vitest directly with isolated connection settings and closes database connections before its owned-container cleanup. It is separate from the ordinary check/pre-commit commands. Primitive unit tests were narrowed or given a RegistrationService override so they remain offline after the new DataSource dependency. The Git index was left unchanged; all repairs/new test files require developer staging. The next checkpoint is the registration HTTP boundary and its controls.

### Developer coding-style correction — 24 November 2026

The developer explicitly requires readable TypeScript variable annotations and multiline conditional bodies. The agent restored annotations in the registration service/unit/database tests, preserved the developer's already-braced service guards, expanded the remaining bare guards in test/tooling files, and enabled ESLint curly/all for backend TypeScript/JavaScript. Root/backend instructions and engineering conventions record the preference; no unchecked casts were introduced to replace variable declarations. Application behavior and database-test boundaries are unchanged.

The full npm.cmd run check passed: typecheck, lint, formatting, all 137 unit tests, one database-stubbed HTTP smoke test, seven hook tests, Nest build and compiled blocklist smoke. An AST inspection found no remaining bare if bodies in backend source/tests/scripts. PostgreSQL was not rerun for these type/formatting changes; the prior ten passing database cases remain the last database execution evidence. No Git staging, commit or database operation was performed.

test:db is the command introduced during the delegated registration completion checks. It implements part of F-07 and should be extended for remaining schema/HTTP/CI work rather than duplicated. It is not automatically required by normal check or the commit hook; relevant persistence behavior still needs database evidence before acceptance.

### Frontend and Compose — 17 October 2026

Implementation commit: `979d4bdafa2c384e94f1df971db374327793c47f`; prepared through [PR #8](https://github.com/thienan2003bt/TenantFlow/pull/8). These results concern the frontend/Compose foundation and do not establish the current PR's merge state or backend auth behavior.

| Check | Recorded result | Boundary |
| --- | --- | --- |
| Local frontend | Locked install, Node.js 22 lint/type checks, placeholder production build, development startup and production HTTP smoke passed. | Fake Stack Auth values test build/startup behavior, not authentication. |
| Compose configuration | Rendering passed with placeholders and the example configuration. | Rendering is not database or image runtime verification; a local Docker engine/buildx was unavailable in that session. |
| Hosted frontend | Lint and production build passed in [corrected CI run 39048634979](https://github.com/thienan2003bt/TenantFlow/actions/runs/39048634979). | Does not verify real sign-in, account, or team flows. |
| Hosted PostgreSQL | Readiness wait, SQL connection (`SELECT 1`), and service cleanup passed in that run. | No TenantFlow migrations or business tables were implemented. Named volumes were preserved. |
| Hosted frontend image | Image build, container start, bounded-retry HTTP smoke and cleanup passed in that run. | A previous probe failed during startup; the corrected run is the successful evidence. |
| Secret boundary | A fake private-key marker was absent from 32 generated browser assets during the local review. | This is a targeted artifact check, not a security certification. |

## Open follow-ups

These are local tracking IDs. The [accepted contract](../requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) owns finalized first-slice policies/mappings, the [temporary development plan](../SESSION_AUTH_DEVELOPMENT_PLAN.md) owns implementation checkpoints, and the [roadmap](ROADMAP.md#current-priorities-and-learning-preferences) owns task order. All three mappings have passed offline review and earlier full local checks. Manual isolated-schema verification is now developer-reported above; automated migration/registration persistence checks now pass. Remaining schema automation and actual account/session HTTP/browser behavior remain unfinished.

| ID | Work still needed | Completion evidence / owning document |
| --- | --- | --- |
| F-01 | Replace inherited frontend Stack Auth with TenantFlow account/session and organization flows. | After backend contracts exist, verify registration/login/logout, recovery/account settings and authorized organization switching while preserving template assets/license. Status: queued frontend transition. |
| F-02 | Implement first-slice auth and design the later account lifecycle. | Follow the finalized [accepted contract](../requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract). Password hashing, shared input parsing and the pinned blocklist pass their checks; monthly blocklist review, deployment hashing benchmarks, registration HTTP/auth/browser workflows, verification/recovery and internationalized-email input remain later work. Status: registration service and its database completion checks verified; HTTP workflows pending. |
| F-03 | Verify persistence and later domain design. | Three mappings and generated InitialAuth are registered and pass local checks under the [three-entity contract](../requirements/BACKEND_REQUIREMENTS.md#minimal-auth-persistence-mapping). Manual migration/constraint/concurrency/rollback checks are developer-reported complete above; automate them under F-07. Broader model candidates in section 2 still need tenant/history-safe design. Status: manual checkpoint reported complete; automated migration/registration cases pass, remaining schema cases pending. |
| F-04 | Complete the NestJS foundation inside `backend/`. | Configuration validation/tests and TypeORM wiring exist. Add health HTTP coverage, database readiness, backend CI/container wiring and meaningful auth/isolation tests under the [roadmap](ROADMAP.md). Status: in progress. |
| F-05 | Verify TypeORM/PostgreSQL behavior and select feasible hosting. | CLI connectivity/generation and isolated migration/constraint/concurrent-uniqueness/rollback/cleanup checks are user-reported successful. Agent-run migration/registration integration tests now pass. Still prove Nest startup/shutdown, session concurrency and cleanup and the remaining F-07 checks. Compare provider cost/capability, settle exact trusted proxies/Host forwarding and verify deployment compatibility while preserving local PostgreSQL data. Status: configuration/commands implemented, manual schema verification reported, application integration pending. |
| F-06 | Verify backend CI, replacement frontend hosting and transactional email delivery. | Observe actual backend CI runs and hosted runtime checks. Verify verification/reset/invitation delivery to intended recipients; provider accounts and delivery infrastructure are not configured. Status: queued validation/design. |
| F-07 | Agent: extend PostgreSQL integration verification. | The owned Docker CLI harness and ten migration/registration cases now pass. See the [remaining TODO](#automated-postgresql-integration-testing--todo) for broader schema checks, assembled HTTP coverage and hosted CI. Status: partially implemented and locally verified. |
| F-08 | Shared auth input parser corrections — complete. | See [completed parser corrections](#shared-auth-input-corrections--completed) below; all 72 parser cases and the full local check pass. Registration itself remains unfinished. |

### Automated PostgreSQL integration testing — TODO

**F-07 — partially implemented and locally verified.** The dedicated Vitest suite uses disposable PostgreSQL 17 through the existing Docker CLI, avoiding a new Testcontainers dependency. This is a registration PR verification deliverable; the ordinary database-stubbed HTTP test and check command remain separate.

- [x] Provision an owned/labelled container with a dynamic loopback port, tmpfs database storage, bounded readiness and teardown on pass/failure. Test-only settings guard against accidental development targets; no shared database/volume is used.
- [x] Apply, revert and reapply the actual registered migration with synchronization disabled. Verify PostgreSQL major version and restored migration status.
- [ ] Automate the remaining standalone manual schema CHECK/FK/cardinality cases beyond the constraints exercised by registration.
- [x] Exercise real registration persistence: pending user plus credential, real hash verification, no session, credential/status preservation across duplicates, forced credential-write rollback and explicitly overlapping duplicate transactions on separate connections.
- [ ] Exercise assembled registration HTTP behavior with real PostgreSQL and the same bootstrap protections: generic 202 for valid new/duplicate input, invalid input, controlled persistence faults and secret-free responses.
- [x] Isolate test rows between cases; infrastructure failures fail visibly. The test:db script and vitest.config.db.ts exist and pass locally. Concurrency/HTTP cases are not hidden inside one outer connection's rollback transaction.
- [ ] Run the suite in an appropriate Linux CI job with disposable PostgreSQL and publish actual results. Keep broad unrelated CI infrastructure out of the first registration task.


### Shared auth input corrections — completed

**F-08 — completed by the agent at the developer's request.** The shared parser enforces the strict object/email contract and retained Unicode/code-point bounds. Its 72 tests and the full backend check pass, as recorded above. The pinned blocklist and its RegistrationService consumer are also implemented and tested. The registration HTTP endpoint and its protections remain unfinished.

## Documentation checks

Historical documentation-only checks are retained below. Their counts describe the documents examined at the time; they do not establish application or database behavior.

| Review | Recorded evidence |
| --- | --- |
| 18 October 2026 reorganization | 15 Markdown documents, 119 local links and 17 anchors passed; whitespace/reference checks passed. A preservation check covered 62 application/model/configuration paths, SRS/backlog content and the historical release schedule. |
| 22 October 2026 planning | 16 tracked Markdown documents, 117 local links and 19 anchors passed; whitespace checks passed. |
| Session-auth tracker introduction | 17 Markdown documents, 132 local links and 24 anchors passed; whitespace/final-newline checks passed. |
| 23 October 2026 stack decision | 18 Markdown documents, 147 local links and 30 anchors passed; whitespace/final-newline checks passed. |
| 25 October 2026 contract acceptance | Four changed documents, 48 local links and 21 anchors passed; whitespace/final-newline checks passed. Accepted policies and remaining proposals were recorded separately. |
| 25 October 2026 documentation cleanup | All 150 local links and 33 anchors across 18 tracked Markdown documents resolved, including tracked paths hidden by ignore rules. Whitespace/final-newline checks passed for five changed documents, and `git diff --check` passed. Stale instructions and duplicate draft wording were removed; accepted policies, pending proposals and useful dated evidence were preserved. |
| 25 October 2026 incremental PostgreSQL guidance | All 153 local links and 33 anchors across 18 tracked Markdown documents resolved; whitespace/final-newline checks passed for six changed documents, and `git diff --check` passed. Added the gradual-checkpoint rule and pgAdmin/connection instructions; recorded Docker readiness as user-reported. PostgreSQL/pgAdmin/Nest runtime checks were not executed. |
| 25 October 2026 password-service documentation sync | All 153 local links and 33 anchors across 18 tracked Markdown documents resolved; whitespace/final-newline checks passed for five changed documents and two test files, and `git diff --check` passed. Runtime test results and the outstanding service formatting check are recorded separately above. |
| 12 November 2026 first-slice contract finalization | All 153 local links and 34 anchors across 18 tracked Markdown documents resolved; final-newline and branch whitespace checks passed for the eight changed documents. Checked first-slice policy/mapping consistency, repaired retired worksheet anchors and reconciled SRS refresh-token vocabulary with opaque-session renewal. Application, database and browser checks were not rerun for this documentation batch. |
| 24 November 2026 migration-guide consolidation | All 174 local links and 38 anchors across 19 Markdown documents, including the new untracked guide, resolved. Command references match the four package scripts; final-newline and whitespace checks passed. The migration-directory README now owns the workflow and data/history safeguards; repeated instructions and retired anchors were removed elsewhere. No code/configuration/SQL changes, application checks, database operations or Git publication were performed in this batch. |

The historical documentation-only batches above did not execute application/database/browser checks. Current testing evidence is recorded in its own dated section; keep future results attached to their actual command/environment and observed outcome.

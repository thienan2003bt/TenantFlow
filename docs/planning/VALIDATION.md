# Validation and follow-ups

[Documentation index](../README.md) · [Implementation roadmap](ROADMAP.md)

This register owns observed verification results, their limits and open checks. Dated results are historical evidence, not checks rerun against the current working tree. Use the [backend README](../../backend/README.md) for commands and the roadmap for sequencing.

## Recorded foundation checks

### Backend foundation — 23 October 2026

| Check | Recorded result | Boundary |
| --- | --- | --- |
| Static/build checks | Typecheck, ESLint, formatting and Nest build passed. | Does not establish real database or auth behavior. |
| Unit and HTTP tests | 14 unit tests and one HTTP smoke test passed. Current source includes configuration/database validation and Hello World tests. | The HTTP suite stubs the DataSource and checks GET /; it does not cover health HTTP behavior, PostgreSQL or auth. |
| Compiled CLI loading | The installed TypeORM loader loaded the compiled DataSource with synthetic database-only settings; it remained uninitialized. | No database connection or feature migration was executed. |
| Application startup | Compiled/watch startup and HTTP health smoke have earlier recorded evidence. | Real application/CLI PostgreSQL startup and connection cleanup remain unverified. Docker was unavailable and no local listener was reachable on port 5432 during the database review. |

Next database checks: verify PostgreSQL container health, SQL execution and Windows client access using the [PostgreSQL guide](../setup/POSTGRESQL_SETUP.md), then confirm backend environment settings and verify compiled startup, migration status and shutdown using the backend README. Configuration tests do not substitute for these checks.

On 25 October 2026 the developer reported successful Docker Client/Server, Compose and Linux-engine checks after setup. This is user-reported readiness, not an agent-executed Docker check. PostgreSQL startup, SQL/client access and the Nest connection remain pending; pgAdmin is an optional local client.

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

These are local tracking IDs. The [accepted contract](../requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) owns auth policies, the [temporary development plan](../SESSION_AUTH_DEVELOPMENT_PLAN.md) owns the active slice and remaining proposals, and the [roadmap](ROADMAP.md#current-priorities-and-learning-preferences) owns task order. Step 2's independent connection checkpoint is current; remaining Step 1 choices are still pending before auth mappings/handlers.

| ID | Work still needed | Completion evidence / owning document |
| --- | --- | --- |
| F-01 | Replace inherited frontend Stack Auth with TenantFlow account/session and organization flows. | After backend contracts exist, verify registration/login/logout, recovery/account settings and authorized organization switching while preserving template assets/license. Status: queued frontend transition. |
| F-02 | Complete application-owned auth design and account lifecycle. | Settle the [remaining Step 1 proposals](../SESSION_AUTH_DEVELOPMENT_PLAN.md#remaining-step-1-close-out-decisions); preserve the [accepted contract](../requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract). Hashing feasibility, auth/browser tests and the broader verification/recovery lifecycle remain unfinished. Status: baseline accepted, Step 1 close-out pending. |
| F-03 | Review provisional model names, constraints, joins, deletion/timestamp policy and ERD/migration design. | Resolve the candidates in [backend requirements section 2](../requirements/BACKEND_REQUIREMENTS.md#2-data-integrity-and-lifecycle), including tenant safety and history retention. Status: open design. |
| F-04 | Complete the NestJS foundation inside `backend/`. | Configuration validation/tests and TypeORM wiring exist. Add health HTTP coverage, database readiness, backend CI/container wiring and meaningful auth/isolation tests under the [roadmap](ROADMAP.md). Status: in progress. |
| F-05 | Verify TypeORM/PostgreSQL behavior and select feasible hosting. | Prove real startup/shutdown, migrations, transactions, constraints, session concurrency and cleanup. Compare provider cost/capability and verify deployment compatibility while preserving local PostgreSQL data. Status: configuration implemented, runtime integration pending. |
| F-06 | Verify backend CI, replacement frontend hosting and transactional email delivery. | Observe actual backend CI runs and hosted runtime checks. Verify verification/reset/invitation delivery to intended recipients; provider accounts and delivery infrastructure are not configured. Status: queued validation/design. |

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

No application tests, Docker runtime, database migrations, auth flows or browser checks were run for these documentation updates. Keep future runtime evidence attached to its actual command/environment and observed outcome.

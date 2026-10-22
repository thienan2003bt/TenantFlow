# Validation and follow-ups

[Documentation index](../README.md) · [Implementation roadmap](ROADMAP.md)

This file retains the useful final evidence and open follow-ups from the completed backend retirement. It replaces references to the removed temporary cleanup plan. Results below are historical reports from 17 October 2026, not checks rerun during the documentation reorganization on 18 October 2026.

## Recorded foundation checks

Implementation commit: `979d4bdafa2c384e94f1df971db374327793c47f`. The retirement was prepared through [PR #8](https://github.com/thienan2003bt/TenantFlow/pull/8). This document does not assert its current merge state.

| Check | Recorded result | Boundary |
| --- | --- | --- |
| Local frontend | Locked install, Node.js 22 lint/type checks, placeholder production build, development startup and production HTTP smoke passed. | Fake Stack Auth values test build/startup behavior, not authentication. |
| Compose configuration | Rendering passed with placeholders and the example configuration. | Rendering is not database or image runtime verification; a local Docker engine/buildx was unavailable in that session. |
| Hosted frontend | Lint and production build passed in [corrected CI run 39048634979](https://github.com/thienan2003bt/TenantFlow/actions/runs/39048634979). | Does not verify real sign-in, account, or team flows. |
| Hosted PostgreSQL | Readiness wait, SQL connection (`SELECT 1`), and service cleanup passed in that run. | No TenantFlow migrations or business tables were implemented. Named volumes were preserved. |
| Hosted frontend image | Image build, container start, bounded-retry HTTP smoke and cleanup passed in that run. | A previous probe failed during startup; the corrected run is the successful evidence. |
| Secret boundary | A fake private-key marker was absent from 32 generated browser assets during the local review. | This is a targeted artifact check, not a security certification. |

The frontend source/license, provisional root models, and PostgreSQL data configuration were preserved. At that historical retirement checkpoint the backend remained unimplemented. The original tracker and detailed investigation are available in Git history; they are no longer active setup instructions.

## Documentation review on 18 October 2026

The documentation reorganization checked 15 Markdown documents: 119 local document/image links and 17 heading anchors resolved. Tracked-reference and placeholder audits passed. Whitespace checks passed for tracked edits and new documents. The SRS and future-backlog content were preserved apart from relative links; the historical release schedule was preserved verbatim. A preservation check covered 62 tracked application/model/configuration paths.

The supplied request-lifecycle image was inspected and linked into the revised conventions guide. No backend scaffold, source, tests, dependency manifests or environment files were created. No application runtime checks were rerun for this documentation-only change; the historical results above retain their original limits.

## Open follow-ups

The backend passed type/lint/format/build checks, the existing one-test unit/e2e suites, compiled/watch startup and HTTP health smoke during the implementation review. The current suites still only cover Hello World; their success does not certify health/configuration coverage. The completed setup walkthrough has been removed, and review feedback is kept in the conversation.

These are local tracking IDs, not GitHub issues. Completing backend retirement does not complete any of these items.

On 22 October 2026 the user confirmed application-owned session auth, PostgreSQL with an ORM, flexible hosting comparison and the initial auth slice. F-01/F-02 below replace the earlier target of integrating backend identity with template Stack Auth. Historical frontend evidence remains valid only for its original limited checks. The [temporary development tracker](../SESSION_AUTH_DEVELOPMENT_PLAN.md) owns the active Step 1 checklist; broader sequencing is owned by the [roadmap](ROADMAP.md#current-priorities-and-learning-preferences), and durable choices/research by [backend requirements](../requirements/BACKEND_REQUIREMENTS.md#current-identity-and-database-options).

| ID | Work still needed | Completion evidence / owning document |
| --- | --- | --- |
| F-01 | Replace inherited frontend Stack Auth with the future TenantFlow account/session and organization flows. | Original provider-flow verification target superseded by user direction; replacement is not implemented. After backend contracts exist, verify registration/login/logout, recovery/account settings and authorized organization switching, preserving template assets/license. Status: queued frontend transition. |
| F-02 | Design application-owned credentials, sessions and account lifecycle. | Record hashing, normalized identity uniqueness, session/token storage, expiry/renewal/rotation/revocation, cookie/CSRF or bearer behavior, recovery/verification tokens, abuse controls and deletion policy. Verify chosen-runtime hashing feasibility. See [backend requirements](../requirements/BACKEND_REQUIREMENTS.md). Status: selected next, open design. |
| F-03 | Review provisional model names, constraints, joins, deletion/timestamp policy and ERD/migration design. | Resolve the candidates in [backend requirements section 2](../requirements/BACKEND_REQUIREMENTS.md#2-data-integrity-and-lifecycle), including tenant safety and history retention. Status: open design. |
| F-04 | Complete the NestJS foundation inside `backend/`. | Minimal startup and HTTP health smoke passed. Add configuration/health coverage and continue database/migrations, identity/tenant contracts, CI/container wiring and meaningful auth/isolation tests under the [roadmap](ROADMAP.md). Status: in progress. |
| F-05 | Validate selected TypeORM/PostgreSQL integration and evaluate feasible hosting. | ADR 0001 accepts TypeORM repositories/Data Mapper and reviewed migrations with synchronization disabled. Released versions, ESM runtime/CLI, transactions, constraints, session concurrency, migrations and cleanup remain unverified. Compare effective provider costs/capabilities without a Cloudflare-only restriction and preserve local PostgreSQL data. Status: architecture accepted, implementation pending. |
| F-06 | Verify backend CI, replacement frontend hosting and transactional email delivery. | Source inspection is not hosted execution. A backend CI job must actually run; framework hosting needs a compatibility test; verification/reset/invitation delivery needs a suitable provider and recipient support. Cloudflare Free email to verified destinations does not establish arbitrary-recipient delivery. Status: queued validation/design. |

The 22 October 2026 planning update checked 117 local links and 19 heading anchors across 16 tracked Markdown documents; all resolved, and `git diff --check` passed. Official product/security documentation and relevant driver-maintainer discussion were reviewed. No application tests, dependency installs, authentication flows, database migrations, Cloudflare deployments or billing/account checks were run.

The subsequent session-auth tracker update checked 132 local links and 24 heading anchors across 17 Markdown documents, including the new untracked plan; all resolved. Tracked whitespace checks and a direct whitespace/final-newline check on the new plan passed. Changes were documentation only; branch creation, ORM installation, generators, migrations and runtime tests were not performed.

The 23 October 2026 accepted-stack update added ADR 0001 and reconciled its architecture/planning references. All 147 local links and 30 heading anchors across 18 Markdown documents resolved. Tracked whitespace checks and a direct whitespace/final-newline check of the new ADR passed; changed paths were documentation only. No dependencies, generators, migrations, runtime tests, Git mutations or publication were performed. TypeORM/package compatibility and the auth slice remain unverified implementation work.

Keep milestone status in the roadmap and product/release scope in the SRS. Update this register when evidence changes; do not treat an intended command or placeholder smoke check as a completed product flow.

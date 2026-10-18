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

The frontend source/license, provisional root models, and PostgreSQL data configuration were preserved. The backend remains unimplemented. The original tracker and detailed investigation are available in Git history; they are no longer active setup instructions.

## Documentation review on 18 October 2026

The documentation reorganization checked 15 Markdown documents: 119 local document/image links and 17 heading anchors resolved. Tracked-reference and placeholder audits passed. Whitespace checks passed for tracked edits and new documents. The SRS and future-backlog content were preserved apart from relative links; the historical release schedule was preserved verbatim. A preservation check covered 62 tracked application/model/configuration paths.

The supplied request-lifecycle image was inspected and linked into the revised conventions guide. No backend scaffold, source, tests, dependency manifests or environment files were created. No application runtime checks were rerun for this documentation-only change; the historical results above retain their original limits.

## Open follow-ups

These are local tracking IDs, not GitHub issues. Completing backend retirement does not complete any of these items.

| ID | Work still needed | Completion evidence / owning document |
| --- | --- | --- |
| F-01 | Verify real Stack Auth sign-in/out, account management, team creation/selection and tenant-switch UI with a configured project. | Record environment/commit and observed outcomes without credentials or account data. Follow [Start Here](../setup/START_HERE.md). Status: unverified. |
| F-02 | Decide NestJS credential verification and provider-user/team to domain-user/tenant mappings. | Record identifier compatibility, membership/permissions, lifecycle ownership, synchronization and revocation policy in a decision record. See [backend requirements](../requirements/BACKEND_REQUIREMENTS.md). Status: open design. |
| F-03 | Review provisional model names, constraints, joins, deletion/timestamp policy and ERD/migration design. | Resolve the candidates in [backend requirements section 2](../requirements/BACKEND_REQUIREMENTS.md#2-data-integrity-and-lifecycle), including tenant safety and history retention. Status: open design. |
| F-04 | Implement the NestJS foundation at the repository root. | The developer adds real source, configuration, API contracts, migrations, health checks, CI/container wiring and meaningful auth/isolation tests. Use the [setup guide](../setup/NESTJS_BACKEND_SETUP.md) and [roadmap](ROADMAP.md). Status: not started. |

Keep milestone status in the roadmap and product/release scope in the SRS. Update this register when evidence changes; do not treat an intended command or placeholder smoke check as a completed product flow.

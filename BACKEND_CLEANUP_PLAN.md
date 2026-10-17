# Backend Cleanup Plan: Retire .NET, Target NestJS

**Created:** 2026-10-17 (Asia/Bangkok)

**Branch:** `chore/retire-dotnet-backend`

**Base:** local `dev` at `fec9987798afab7bbdf8caf7ec8d8dbb0c2649df`

**Intended PR base:** `dev`

**Overall status:** First cleanup batch implemented: all backend implementation files and obsolete guides removed; requirements preserved. Static verification recorded below; runtime/CI validation and PR preparation remain open.

This document tracks the removal of the .NET backend and its obsolete guidance while preserving the product requirements and technical knowledge useful for a NestJS backend. The first deliverable was this document only (commit `c341909`). The next authorized batch removes all backend implementation and starts again from requirements/documentation, with no replacement NestJS scaffold. The existing frontend remains. Later changes on this branch and its PR should follow the steps and record evidence here.

## 1. Baseline and application overview

The initial pass covered the tracked file inventory, source structure and representative implementations, all 14 existing Markdown documents at outline/content level, configuration, Docker, CI, and repository-wide reference searches. This is a shallow repository review, not a runtime verification, security audit, or exhaustive domain correctness review. There were 90 tracked files and a clean working tree before this document was added. No applicable `AGENTS.md` was found.

Local `dev` and the existing `origin/dev` tracking ref both pointed to the base above. The remote was not fetched; this records the local starting point, not a claim about the latest server state.

Starting references: [product requirements](docs/init/TenantFlow-SRS.md), [implementation roadmap](docs/init/ROADMAP.md), [model definitions](schemas.ts), [domain enums](enum.ts), and [release planning](versions/1.0.0/VERSION-PLANNING.md).

| Area | What exists at the baseline | Implication for cleanup |
| --- | --- | --- |
| Product | A planned multi-tenant B2B workspace for organizations, memberships, RBAC, customers, projects/tasks, subscriptions, files, notifications, reporting, and audit logs. | Preserve these requirements regardless of backend framework. |
| Frontend | `frontend/`: Next.js 15.1.11, React 19, TypeScript, Tailwind, reusable UI components, landing page, team dashboard, and Stack Auth integration. | Preserve the app, assets, lockfile, license, and auth flows. Dashboard figures and several routes are template/demo content, not proof of implemented business features. |
| Authentication | `frontend/stack.tsx`, the root provider, auth handler, and dashboard use `@stackframe/stack` for users and teams. | Do not replace this with homegrown auth as an incidental cleanup change. Backend identity and tenant mapping still need a decision. |
| Backend | `backend/`: a .NET 8 solution with API, Core, and Infrastructure projects. The API exposes `/`, `/weather-forecast`, and `/db-check`; the EF context has no entity sets/mappings. Core contains a user-status enum and placeholder classes remain. | This is a scaffold, not an implemented business backend. No tracked migrations or backend test project were found. |
| NestJS | No NestJS package, bootstrap, module tree, or backend implementation was found in this checkout. Mentions in a setup comparison table are not an implementation. | NestJS is the selected direction. Do not document an existing NestJS app or invent its commands. Re-inventory if code is added before cleanup. |
| Domain design | Root `schemas.ts` and `enum.ts` contain extensive TypeScript model definitions, constraints/defaults in comments, and lifecycle enums. | Keep them as design references. They are not executable database migrations, request validation, or a wired shared package. |
| Local services | Compose builds .NET API and frontend images and runs PostgreSQL 17 with a named data volume. The frontend has a Compose dependency on `api`; no application calls to this .NET API were found in the shallow source scan. | Remove obsolete service wiring together. Preserve PostgreSQL and its data. Stack Auth remains an external dependency of the frontend. |
| Automation | CI detects backend/frontend path changes, runs .NET restore/build/test, builds the frontend, and conditionally builds images. | Remove .NET jobs and all dependent references. The frontend `test` script currently only prints a message; it is not test coverage. |
| Documentation | Root README, SRS, implementation roadmap, eight setup guides, frontend template README, and two release-planning documents. | Reconcile contradictory stack, scope, setup, and progress statements across all of them. |

## 2. Scope and working rules

- Retire all tracked .NET source, projects, solution files, configuration, launch profiles, HTTP samples, and .NET Docker/CI tooling.
- Remove active instructions and recommendations that require the retired stack, including less obvious library and architecture references.
- Preserve framework-independent requirements, schema design, PostgreSQL operations, frontend behavior, and useful integration constraints.
- Extract useful information from mixed documents before deleting their originals. Use Git history for the retired implementation instead of retaining an active .NET archive in the tree.
- Keep this cleanup and any later NestJS implementation distinct. Building the new API, choosing an ORM/auth provider, redesigning schemas, and implementing features are follow-up work unless the scope is explicitly expanded.
- Since no NestJS app exists at baseline, the default cleanup end state is a documented frontend + PostgreSQL foundation with the backend marked **planned**. Remove the dead API service and CI jobs; add NestJS wiring only with real source and verified scripts.
- Do not reset databases, delete volumes, rewrite Git history, or remove user-local files as part of source cleanup. Audit tracked files even when ignore rules hide them.
- Mark a task complete only with its changed paths and review/check evidence. An unchecked item is pending, not implied complete by this plan.

## 3. File disposition inventory

The table records baseline paths, including files now deleted. Paths are relative to the repository root. Statuses reflect this cleanup batch; pending runtime/product decisions are not implied complete.

| Path | Action | Content to preserve or review | Status |
| --- | --- | --- | --- |
| `backend/TenantFlow.sln` | Delete | No runtime value after retirement; recoverable from Git. | Deleted after preservation review |
| `backend/TenantFlow.Api/` (6 tracked files) | Delete | `Program.cs`, project file, both appsettings files, launch settings, and HTTP sample. Preserve the need for API documentation and database health checks as future requirements, not these implementations. | Deleted after preservation review |
| `backend/TenantFlow.Core/` (3 tracked files) | Delete after enum comparison | Check `Enums/UserStatus.cs` against root `enum.ts`; preserve lifecycle meaning, not C# enum ordinals. Remove project file and `Class1.cs`. | Deleted after preservation review |
| `backend/TenantFlow.Infrastructure/` (3 tracked files) | Delete | Empty EF context, project/package references, and placeholder class. Extract relevant database assumptions from docs first. | Deleted after preservation review |
| `backend/Dockerfile` | Delete | Remove .NET SDK/runtime images and DLL entrypoint. Do not substitute a Dockerfile for nonexistent NestJS source. | Deleted after preservation review |
| `docker-compose.yml` | Edit | Remove/replace `api` build, ASP.NET environment, and `5024:8080` mapping; remove the frontend's `depends_on: api` in the no-backend transition. Keep PostgreSQL 17, its named volume, frontend build, and Stack Auth configuration. | Done |
| `.github/workflows/ci.yml` | Edit | Remove .NET setup/restore/build/test and backend image build. Reconcile change-filter outputs, `needs`, result conditions, and image-job conditions together. Preserve frontend validation. | Done |
| `.env.example` | Edit after config review | Currently only `ENVIRONMENT`; not a usable backend configuration contract. Document only variables actually consumed in the resulting checkout, with placeholders. | Done |
| `.gitignore` | Simplify selectively | Replace the large Visual Studio/.NET template with rules needed for Node/Next, secrets, OS/editor files, logs, and generated outputs. Keep example env files trackable and actual env files ignored. | Done |
| `.vscode/settings.json` | Edit selectively | Remove retired terms such as `appsettings`, `aspnet`, `ASPNETCORE`, and `Npgsql`; preserve useful domain/tool vocabulary. | Done |
| `README.md` | Rewrite stack/setup/status sections | Preserve product, tenant isolation, RBAC, billing, data modeling, deployment constraints, and quality requirements. Fix imaginary paths, roadmap links, and branch naming. | Done |
| `docs/init/TenantFlow-SRS.md` | Keep; reconcile targeted conflicts | Preserve business and non-functional requirements. Clarify implementation status and align identity, tenancy, and MVP scope decisions without silently shrinking the product. | Done |
| `docs/init/BACKEND_REQUIREMENTS.md` (new) | Add requirements/design notes | Preserve unique tutorial constraints, identity boundaries, security outcomes and operations; record unresolved decisions without implementation examples. | Done |
| `docs/init/ROADMAP.md` | Edit | Remove ASP.NET Identity and SignalR prescriptions; retain auth/session and live-update outcomes. Reconcile scaffold status with version planning and the post-cleanup state. | Done |
| `docs/setup/START_HERE.md` | Rewrite as the setup entrypoint | Preserve onboarding intent, identity relationship explanations, and relevant credential handling. Remove .NET steps, unsupported success claims, old dates/statuses, absolute personal paths, and framework comparison advice. Explicitly state the backend is planned until present. | Done |
| `docs/setup/BACKEND_DEPENDENCIES.md` | Delete after extraction | Retire NuGet version matrices and future .NET packages. Preserve integration needs in canonical requirements; do not invent an approved NestJS dependency matrix. | Deleted after preservation review |
| `docs/setup/BACKEND_SETUP_COMPLETE.md` | Delete after extraction | Fold any unique useful architecture/onboarding notes into the retained entrypoint or requirements. Remove duplicated summaries and unverified completion claims. | Deleted after preservation review |
| `docs/setup/BUILDING_CORE_LAYER.md` | Extract, then delete | Retain identity entities, DTO exposure boundaries, lifecycle semantics, UUIDs, timestamps, and use cases where not already captured. Drop C# examples and project/layer instructions. | Deleted after preservation review |
| `docs/setup/BUILDING_INFRASTRUCTURE_LAYER.md` | Extract, then delete | Review unique relationships, constraints, indexes, deletion behavior, and integration boundaries. Do not blindly port EF mappings, unscoped repository examples, or sample password hashing. | Deleted after preservation review |
| `docs/setup/DOTNET_COMMANDS.md` | Delete | .NET CLI, EF migration, NuGet, and .NET troubleshooting guidance is obsolete. Repair all incoming references. | Deleted after preservation review |
| `docs/setup/ENV_AND_GITIGNORE_SETUP.md` | Rewrite and shorten | Retain secret handling and local/container distinctions. Remove .NET configuration classes, user-secrets steps, and duplicated ignore templates. Match actual env files and Compose settings. | Done |
| `docs/setup/POSTGRESQL_SETUP.md` | Keep; rewrite mixed sections | Keep Docker/DBeaver/psql operations and volume guidance; remove .NET prerequisites, project tree, appsettings, EF wiring, and false expected results. Recheck troubleshooting before carrying it forward. | Done |
| `frontend/README.md` | Correct onboarding/status | Replace upstream clone/setup assumptions with repository-specific paths; correct Next.js 14 to the package's actual version and explain Stack Auth prerequisites. Preserve attribution and license. | Done |
| `frontend/` source, assets, package files, and Dockerfile | Preserve; audit integration assumptions | No backend rewrite is needed for the template UI. Review Docker/env behavior only where needed for a truthful supported startup path. Record unrelated template cleanup separately. | Retained; Docker handoff validation pending |
| `schemas.ts`, `enum.ts` | Preserve; annotate unresolved design issues | These are useful NestJS inputs. Reconcile naming, identity ownership, and tenant scoping before implementation; do not convert to an ORM during retirement. | Retained unchanged; implementation decisions documented |
| `versions/1.0.0/VERSION-PLANNING.md` | Edit | Mark the retired backend foundation as retired, not completed NestJS work. Reconcile CI status, unsupported ERD/migration claims, dates, and scope. | Updated; detailed product release placement open |
| `versions/1.0.0/FUTURE-ROADMAP.md` | Keep; reconcile scope | Preserve future product ideas, integrations, and providers. Clarify overlap with MVP requirements rather than deleting features based on framework keywords. | Updated; detailed product release placement open |

The backend inventory totals **14 tracked files**. `backend/TenantFlow.Api/appsettings.Development.json` is tracked despite matching an ignore rule; ordinary `rg --files` missed it, while `git ls-files` and `git grep` exposed it. It is now deleted with the other backend files; its values were not copied into replacement documentation. No new/non-.NET backend files were found in the pre-deletion re-inventory.

## 4. Preservation and decision ledger

[Backend requirements and design notes](docs/init/BACKEND_REQUIREMENTS.md) is the extraction destination added by this batch. The other destinations below are existing canonical sources. Before deleting a source document, record the destination section or confirm that its useful information is already represented there. Preserve intent, not every tutorial example.

| Knowledge to retain | Sources to compare | Destination / required decision | Status |
| --- | --- | --- | --- |
| Tenant boundaries, memberships, invitations, system/tenant/project roles and permissions | README; SRS; `schemas.ts`; core/infrastructure tutorials; START_HERE identity diagram | SRS sections 3, 5, 7, 8 and schema comments. Explicitly distinguish global identities from tenant-owned records and validate child records through their tenant-scoped parents. | Preserved: SRS 3/5/7/8, root models, backend requirements 1-2 |
| Identity lifecycle, provider identity, profiles, sessions, token revocation/rotation, MFA extension points | `schemas.ts`, `enum.ts`, C# user-status enum, auth tutorials, README/roadmap | Keep model vocabulary in the root TS files and auth requirements in the SRS. Decide later which records are owned by Stack Auth and which by TenantFlow. | Preserved: root models/enums, backend requirements 1-3; provider boundary remains open |
| UUIDs, enum values, UTC timestamps, nullable relationships, uniqueness/indexes, join tables, soft deletion, retained history | Root model files; EF mapping examples; SRS data rules | Schema comments and SRS sections 7, 8, 10. Record any unique constraint/deletion rule before discarding its EF example; do not assume examples are correct. | Preserved: SRS 7/8/10 and backend requirements 2, including candidate limits, indexes and deletion rules |
| API boundaries, validation, pagination, safe responses, errors, health/readiness, OpenAPI, logging and tests | Core DTO/service examples; README; roadmaps | SRS requirements and `docs/init/BACKEND_REQUIREMENTS.md` sections 1, 3-5. Identify sensitive fields that must stay out of responses. | Preserved: SRS 6 and backend requirements 1/3; no endpoint paths or libraries chosen |
| Billing history, plan limits, webhook idempotency, file metadata/storage abstraction, notification preferences, audit history | README; SRS; schema and enum files; dependency guide | Keep product outcomes and integrations in the SRS/model files. Remove .NET client prescriptions without deleting the integration requirements. | Already covered: SRS 5/9, root models and backend requirements 4 |
| PostgreSQL operations, host/container connection differences, DBeaver, psql, persistent storage | Compose; PostgreSQL guide; environment guide | Retained PostgreSQL guide and actual environment examples. Local hosts use the published port; containers use the service hostname. Preserve volume/data handling notes. | Preserved: rewritten PostgreSQL guide, connection and data-lifecycle sections |
| Configuration boundaries and secrets | Root/frontend examples; Compose; environment guide; frontend auth setup | Environment guide for variable/file behavior; START_HERE links to it rather than duplicating it. Keep private Stack keys server-side. Do not infer env-file loading from file existence. | Reconciled: environment guide files/consumers and variables tables; START_HERE links to it |

Baseline contradictions and stale statements discovered (historical findings; addressed statements are no longer active guidance). This batch removes the retired prescriptions and fixes navigation/config/status claims. Provider ownership, model consistency, and detailed release placement remain explicitly open in backend requirements and the version notes:

1. **Auth architecture:** README mandates ASP.NET Identity and postpones external providers; the frontend already uses Stack Auth users/teams. Retain the working frontend integration, remove the retired prescription, and document NestJS token verification and user/team-to-tenant mapping as future decisions. Do not assert that a Stack team ID already satisfies the UUID-based domain model or API authorization requirements.
2. **Progress:** the initial roadmap calls the skeleton not started, version planning checks off .NET setup and leaves CI unchecked, and setup summaries call the foundation complete. CI exists, but was not executed in this review; business entities, migrations, and health/auth endpoints described in tutorials are not thereby implemented. Split historical scaffold work, current runnable capabilities, and planned NestJS work.
3. **Release scope and dates:** version planning includes early MFA while the SRS/initial roadmap treats it as future work; tags appear in MVP guidance and the future roadmap, and reporting overlaps both. Resolve these as scope decisions, retaining the requirements and their provenance. Existing June 2026-February 2027 dates are plans, not evidence of delivery; do not fabricate a replacement schedule.
4. **Repository navigation:** README shows nonexistent root `ROADMAP.md`, `src/`, and test/deploy trees; the integration branch is `dev`, not its suggested `develop`. Point to real paths and label any future structure clearly. Setup guides also contain machine-specific `E:\PersonalProjects\...` paths.
5. **Configuration drift:** root `.env.example` only has `ENVIRONMENT`; guides describe additional settings and disagree about root/backend env-file location. Docker and application env loading are different mechanisms. Define the supported files and consumed variables without promising implicit loading.
6. **Docker drift:** the environment guide shows PostgreSQL 15 and `db`/a different volume, while Compose uses PostgreSQL 17 and `postgres`/`tenantflow_postgres_data`. Preserve the actual data volume and align examples. The PostgreSQL guide's unrestricted `compose up` currently starts more than the database.
7. **Samples presented as implementation:** the HTTP sample calls `/weatherforecast/`, but the API maps `/weather-forecast`; START_HERE proposes `/api/health`, which is absent. Retire these samples and do not advertise equivalent NestJS endpoints until verified.
8. **Model design remains provisional:** schema comments refer to `Project.id` and `UserMembership.id` while exported types are `TenantProject` and `TenantMembership`; identity requirements and root model shapes need comparison. Record such findings; schema redesign is follow-up work unless a small documentation clarification is necessary.
9. **Frontend template claims:** frontend README says Next.js 14 while the package uses 15.1.11; demo data, upstream branding, and placeholder routes are scaffolding. Correct misleading setup/capability documentation; broader visual rebranding is a separate task.
10. **Useful provider references:** Azure Blob, Azure AD/SSO, Stripe, OpenAPI/Swagger, PostgreSQL, OpenTelemetry, and general architectural concepts are not automatically obsolete because they also occur in .NET guidance. Review context before removal. Revalidate environment-specific troubleshooting, including timezone workarounds, rather than treating old advice as verified.

## 5. Execution plan

Execute in order. Steps 2-6 can be separate reviewable commits on this branch. Keep service/job removal and its dependent references in the same commit so intermediate revisions do not invoke missing projects.

### Step 1 - Establish the baseline and tracker

- [x] Verify a clean starting tree, inspect branch/history, and inventory tracked files including ignored tracked paths.
- [x] Shallow-scan application code, all existing docs, infrastructure, and stack references.
- [x] Create `chore/retire-dotnet-backend` from local `dev`.
- [x] Create this root tracker with file actions, preservation requirements, known conflicts, and validation criteria.

**Exit (planning commit `c341909`):** that first change contained only `BACKEND_CLEANUP_PLAN.md`; cleanup implementation started in the subsequent batch. Documentation checks are recorded in the log below.

### Step 2 - Preserve useful knowledge and settle documentation boundaries

- [x] Compare each preservation-ledger row against the full source sections before deleting any tutorial. Mark each as preserved at a specific destination, already covered, or obsolete with a reason.
- [x] Extract unique constraints, relationships, security outcomes, and operational guidance into the retained canonical documents. Label unverified examples and unresolved model issues.
- [x] Establish documentation ownership: README for overview/current stack/navigation; SRS for product rules; root TS files for model vocabulary; START_HERE for actual onboarding; environment/PostgreSQL guides for their procedures; initial roadmap for implementation status; version files for release scope/history.
- [x] Record NestJS as the target and Stack Auth as the current frontend integration. Leave ORM, backend auth verification, runtime/package versions, port, validation, jobs, logging, and live-update libraries undecided until implementation evidence exists. Add a concise architecture decision document only if needed.

**Exit:** every mixed document scheduled for deletion has a reviewed preservation entry. No useful rule is discarded simply because its example is C#.

### Step 3 - Remove the .NET scaffold and its execution paths together

- [x] Re-inventory `backend/` immediately before removal to catch newly added or reusable non-.NET files.
- [x] Remove the 14 tracked backend files after Step 2 is complete; retain any newly discovered reusable assets with a recorded destination.
- [x] Remove the .NET API service and frontend service dependency from Compose; keep PostgreSQL, frontend, their required environment, and the existing named data volume.
- [x] Remove .NET CI jobs/image build and update all change-filter outputs, dependencies, conditions, and working directories. Ensure no job or service references a deleted path.
- [x] Review path filters for changes to Compose, Dockerfiles, CI, and shared configuration so relevant validation is not silently skipped. Do not claim a docs-only PR executed builds when filters skipped them.

**Exit:** the supported frontend/database workflow and CI graph no longer require .NET; there is no placeholder NestJS service or green backend test claim without a backend.

### Step 4 - Align configuration and developer tooling

- [x] Remove .NET-specific ignore rules and spelling entries selectively; retain secret, Node/Next, log, generated-file, and relevant editor/OS exclusions.
- [x] Align `.env.example`, `frontend/.env.local.example`, Compose, and setup guidance with actual consumers and loading behavior. Separate browser-public identifiers from private server credentials.
- [x] Review the frontend Dockerfile/CI environment handoff: CI supplies build arguments that the current Dockerfile does not declare, while Compose supplies runtime values. Verify the chosen supported path and fix directly related startup issues or record a concrete limitation.
- [x] Use `git check-ignore` with representative local env, node_modules, Next build, log, and env-example paths; also confirm already tracked files separately. Do not print real environment values.

**Exit:** a contributor can identify required variables and file locations, examples can be tracked, local secrets/generated artifacts stay ignored, and retired environment names/config classes are gone.

### Step 5 - Rewrite and deduplicate documentation

- [x] Rewrite README stack, auth, integrations, architecture, prerequisites, repository layout, workflow, links, and current implementation status; preserve framework-independent sections.
- [x] Rewrite START_HERE, environment, and PostgreSQL guides around the actual resulting checkout. Use repository-relative commands and service-specific startup instructions.
- [x] Delete the five obsolete guides: dependency matrix, setup summary, core tutorial, infrastructure tutorial, and .NET CLI reference, after recording preservation destinations.
- [x] Correct frontend onboarding/version/capability statements while retaining attribution/license and working Stack Auth setup.
- [ ] Finish reconciling release placement of MFA and detailed feature boundaries. SRS, initial roadmap, version planning, and future roadmap now explicitly record the conflicts and backend restart status. Preserve historical context as explicitly retired work; leave unbuilt NestJS features unchecked.
- [x] Remove duplicate instructions, dangling references, obsolete comparison tables, unsupported success statements, and personal absolute paths. Link to one canonical procedure for each task.

**Exit:** all 14 baseline Markdown files have an explicit kept/edited/deleted disposition, and current behavior is separated from planned work. Detailed release placement remains an explicit product follow-up.

### Step 6 - Audit completeness and validate the supported state

- [x] Repeat tracked-file and text searches from section 6. Classify every surviving match instead of excluding entire docs directories.
- [x] Check all local Markdown links, anchors, inline path/command references, code-block examples, CI references, Compose contexts, and env variable names against the final tree.
- [x] Run `git diff --check`, inspect the full diff and deletion list, and verify all preservation destinations. Explicitly confirm the frontend, model references, SRS, license, and PostgreSQL volume survived.
- [ ] Run `docker compose config --quiet`; if Docker is available, verify PostgreSQL with a readiness/connection check and follow the revised local startup guide without deleting data. Avoid `down -v`.
- [ ] Run frontend install/build/lint checks appropriate to the edits and available Stack Auth configuration. Record exact commands, outcomes, and blockers. Treat `npm test` as a placeholder, not validation coverage.
- [ ] Inspect CI's final graph and run/watch the relevant PR checks when available. If secrets, network, or tools prevent a check, leave it explicitly unverified with a follow-up rather than mark it passed.
- [ ] Walk through onboarding from the documented starting directory with placeholder/local config. If only the local frontend path was tested, do not claim container startup is verified.

**Exit:** no active workflow requires the retired stack; preserved knowledge is traceable; documented commands match verified behavior or have a clearly stated limitation.

### Step 7 - Prepare the cleanup PR and close the tracker

- [x] Update every inventory/preservation row with its final action, destination where applicable, and evidence; record any newly discovered files or statements.
- [ ] Prepare a PR against `dev` describing the final cleanup scope, retained domain knowledge, resulting supported startup path, and actual validation. Link this tracker and keep unimplemented NestJS work explicit.
- [ ] Record PR URL, final commit, check results, unresolved decisions, and follow-up issues. This first planning change does not imply a PR was opened or the branch published.
- [ ] Mark overall cleanup complete only when all completion criteria below are met; if this PR ends at planning, label it as planning and leave implementation pending.

**Exit:** the review surface explains both what was removed and why retained information remains useful for NestJS.

## 6. Reference-search and review procedure

Start with tracked files so ignored-but-tracked configuration cannot escape the audit. These are review commands, not deletion commands:

```powershell
git ls-files
git ls-files '*.cs' '*.csproj' '*.sln' '*.fsproj' '*.props' '*.targets' 'global.json' 'NuGet.Config' 'nuget.config' 'appsettings*.json' 'launchSettings.json'
git grep -n -I -i -E 'dotnet|\.net|asp\.?net|aspnetcore|entity.?framework|ef[ -]?core|npgsql|nuget|swashbuckle|TenantFlow\.(Api|Core|Infrastructure)|net8\.0|appsettings|launchSettings|IISExpress' -- . ':!BACKEND_CLEANUP_PLAN.md'
git grep -n -I -i -E 'IHttpClientFactory|Microsoft.Extensions.Http.Resilience|FluentValidation|DataAnnotations|ILogger|Serilog|IHostedService|BackgroundService|Hangfire|SignalR|xUnit|FluentAssertions|Stripe.net|user[- ]secrets|UseNpgsql|AddDbContext|ConnectionStrings|5024|7228|weatherforecast|weather-forecast|db-check' -- . ':!BACKEND_CLEANUP_PLAN.md'
git grep -n -I -E 'DOTNET_COMMANDS|BACKEND_DEPENDENCIES|BACKEND_SETUP_COMPLETE|BUILDING_CORE_LAYER|BUILDING_INFRASTRUCTURE_LAYER|ROADMAP\.md|develop|PersonalProjects|src/|Api.Tests' -- . ':!BACKEND_CLEANUP_PLAN.md'
rg --files --hidden -g '!.git' -g '!node_modules' -g '!dist' -g '!coverage' -g '!bin' -g '!obj'
git diff --check
git diff --stat dev
git diff --name-status dev
```

`git grep` exit code 1 means no matches. Searches are aids, not the definition of completion: also read surviving docs for semantic drift, unimplemented features described as complete, duplicated guidance, old framework links, and stale file trees. Inspect matches locally without copying configuration values into logs or PR text.

Review residual matches individually. OpenAPI/Swagger, generic logging/test concepts, supported provider names, and explicitly labeled retirement history can be legitimate. For each retained legacy reference outside this tracker, record its path and reason here. The tracker itself necessarily names retired files; it must not become an alternate setup guide.

## 7. Completion criteria

- [x] No tracked .NET application/project/config/sample files or active .NET images, commands, dependencies, jobs, or service references remain.
- [x] No retained document recommends the old stack as the current architecture or marks NestJS work done without source and verification.
- [x] Every baseline path is accounted for; repeated semantic and keyword reviews reveal no unclassified stale references or broken local links.
- [x] Each deleted mixed guide has a specific preservation destination or a documented explanation that its content was redundant/obsolete.
- [x] SRS/domain models, enum meanings, tenancy/authorization rules, operational knowledge, frontend auth, attribution/license, and PostgreSQL data persistence remain intact.
- [ ] The supported local startup path, configuration examples, and CI reflect the actual checkout; validation results and limitations are recorded.
- [x] Requirements documents consistently report a backend restart, with unresolved product/architecture decisions explicitly tracked rather than silently chosen.
- [ ] The cleanup PR targets `dev` and links this completed tracker; any remaining NestJS implementation work is recorded separately.

## 8. Progress and evidence log

Use `Pending`, `In progress`, `Done`, or `Deferred` with a reason. Add commit/PR/check links when available; do not substitute an intention for evidence.

| Date | Step | Status | Evidence / next action |
| --- | --- | --- | --- |
| 2026-10-17 | 1: baseline and tracker | Done | Clean initial tree; 90 tracked files, 14 existing Markdown docs, and 14 backend files inventoried. Source/config/outline scans and tracked-file reference searches completed. Branch created from local `dev` at `fec9987`. Only this document is added. |
| 2026-10-17 | Planning document checks | Done | Verified baseline counts, all 21 primary file/document paths in the inventory, local reference links, and branch/HEAD equality with the recorded `dev` base. Reviewed the added document and checked its whitespace with `git diff --no-index --check`; final status contains only this new document. No runtime tests run for this planning-only change. |
| 2026-10-17 | 2: preservation | Done | Full core/infrastructure tutorial sections compared; all seven ledger rows mapped above. New backend requirements sections 1-4 retain identity/model concepts, candidate limits/indexes, deletion/timestamp caveats, response boundaries, integrations and operations. Root schemas/enums unchanged. |
| 2026-10-17 | 3: implementation retirement | Done | All 14 backend files removed after re-inventory found no additional files. Compose API/dependency and all backend CI/filter/image references removed together. PostgreSQL service/volume settings and frontend source retained. |
| 2026-10-17 | 4: configuration/tooling | Done with recorded limitation | Root env example now lists actual frontend settings; ignore rules and spelling entries cleaned. Env/Next/Node/generated-output exclusions and example exceptions checked. Existing frontend Docker build-time Stack Auth handoff remains unverified; documented in START_HERE and environment guide. |
| 2026-10-17 | 5: documentation | In progress | Five obsolete guides deleted after extraction; README, SRS status, roadmap, three setup guides, frontend README and version files updated. Product decisions on MFA/release boundaries and provisional schema consistency remain open; no backend code added. |
| 2026-10-17 | 6: static checks | Done | One-time Node verification passed: all 14 backend files and five guides absent; 46 local Markdown/image references across 11 current documents resolve; current files including the lockfile/new requirements have no unclassified retired-stack matches. CI job/dependency/filter references and Compose paths reviewed. PostgreSQL service/volume text equals the pre-cleanup definition; schemas, enums, frontend package/lockfile/Dockerfile/license unchanged. Whitespace and ignore checks passed. This is static verification, not YAML schema validation, Compose rendering, or an application test. |
| 2026-10-17 | 6: runtime/CI checks | Pending | Docker is unavailable in this environment; Compose rendering/startup and database connectivity cannot be run locally. Existing frontend source/package files are unchanged, dependencies are not installed, and Stack Auth configuration is not provided; frontend build/lint/onboarding and remote CI are not claimed verified. A Compose config check is added to CI. |
| 2026-10-17 | 7: PR | Pending | Current changes are reviewable locally on the existing cleanup branch. No implementation commit, push, or PR was created by this batch. |

### Retained legacy-reference exceptions

No active .NET references remain outside this tracker in the working-tree reference audit. The baseline inventory, search recipes, and historical findings in this tracker intentionally name retired files and technologies for traceability; they are not setup instructions.


### Disposition of deleted guides

| Retired baseline guide | Preservation evidence |
| --- | --- |
| `docs/setup/BUILDING_CORE_LAYER.md` | Entity fields and lifecycle values already exist in root models/enums. Backend requirements 1 preserves identity/role boundaries; 3 preserves DTO exposure and lifecycle use cases. No C# classes retained. |
| `docs/setup/BUILDING_INFRASTRUCTURE_LAYER.md` | Backend requirements 2 preserves all example length limits, join/provider uniqueness, token-index intent, timestamp and deletion candidates with caveats; 3-4 retains service/security/operations intent. Unscoped repository and password-hashing examples deliberately discarded. |
| `docs/setup/BACKEND_DEPENDENCIES.md` | OpenAPI, identity, email, billing, logging/tracing needs retained in backend requirements 3-4 and SRS 5/6/9. Package/version matrices and framework-specific installation rules are obsolete. No dependency approval carried over. |
| `docs/setup/BACKEND_SETUP_COMPLETE.md` | Its onboarding, domain references and boundaries are covered by START_HERE, SRS, root models and backend requirements 1/4. Duplicate summaries, framework commands, imaginary trees and completion claims removed. |
| `docs/setup/DOTNET_COMMANDS.md` | CLI/package/build/migration instructions apply solely to the retired stack and are obsolete. PostgreSQL operations and persistent-data warnings remain in the PostgreSQL guide. |

### Follow-up decisions for NestJS implementation

- Locate/reuse a NestJS implementation if one exists elsewhere; otherwise scaffold it in a separate implementation step.
- Choose and record supported Node/package tooling, NestJS dependencies, persistence/migrations, and API contracts when implementation begins.
- Define Stack Auth token verification, backend user identity, tenant/membership mapping, identifier compatibility, and authorization enforcement.
- Resolve model inconsistencies and MVP-versus-future feature scope with the existing requirements as the starting point.
- Add a real backend startup path, environment contract, Docker/CI, health checks, and meaningful isolation/auth tests alongside real source.

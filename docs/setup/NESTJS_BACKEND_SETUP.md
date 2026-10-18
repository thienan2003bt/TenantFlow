# NestJS backend setup at the repository root

Reviewed 18 October 2026 · Implementation guide · Backend not yet created

[Documentation index](../README.md) · [Engineering conventions](../architecture/BACKEND_CONVENTIONS.md) · [Backend requirements](../requirements/BACKEND_REQUIREMENTS.md) · [Roadmap](../planning/ROADMAP.md)

You implement the backend. This guide supplies an order of work, suggested defaults, acceptance checks, and review checkpoints. The assistant explains and reviews your work; it does not write backend source, tests, migrations, package manifests, or runtime/build configuration. All commands below are instructions for you, and none were executed to create a backend during this documentation update.

## 1. Establish the baseline and make the first decisions

The current checkout has an independent Next.js/Stack Auth application in `frontend/`, PostgreSQL 17 in root Compose, and provisional root `schemas.ts`/`enum.ts` references. There is no root backend package, source directory, migration runner, API, or backend CI job.

Read the [SRS release boundaries](../requirements/TenantFlow-SRS.md#24-canonical-release-boundaries) before choosing a feature. NestJS, PostgreSQL, and a shared database with tenant-scoped records are the direction. Preserve the existing frontend identity integration and database volume. Backend verification of Stack credentials and provider-to-domain mappings still need design.

Record these choices as you make them; recommendations below are not already installed or approved dependencies:

| Concern | Recommended starting point | What you must confirm |
| --- | --- | --- |
| Architecture | One deployable Nest application, organized by feature | Feature ownership and exported providers; no microservices or CQRS requirement |
| Runtime | Latest supported patch of Node.js 24 LTS for the new backend | Nest runtime **and CLI** engine compatibility, chosen npm version, reproducible local/CI/container versions |
| Package management | npm with a separate root lockfile | Keep `frontend/package.json` and its lockfile independent; no workspace migration is needed |
| Nest / HTTP | Current stable Nest with Express unless a requirement favors Fastify | Exact package compatibility and adapter-specific middleware, upload and proxy behavior |
| Module system | Keep the selected CLI template's module system consistent | ESM/CommonJS, imports, emitted files, test runner and integration-library compatibility |
| Validation | Class DTOs with Nest validation as a straightforward baseline | Runtime decorators, explicit parsing, unknown-field behavior, OpenAPI compatibility |
| Persistence | One PostgreSQL data library and its migration tool | Tenant predicates, transactions, composite constraints, reviewed SQL, test setup |
| Identity | Retain Stack Auth ownership unless an explicit decision changes it | Supported API verification, revocation, user/team mappings, memberships and permissions |
| Local HTTP | Frontend `3000`, proposed API `3001` | Configuration consumer and allowed frontend origin; Nest must not collide with the frontend |

Node.js 24 is an LTS line at the review date; the existing frontend still uses Node.js 22. Keep those contracts explicit rather than silently changing frontend CI or its container. Use the [Node release table](https://nodejs.org/en/about/previous-releases) and [Nest prerequisites](https://docs.nestjs.com/first-steps) when you start. Current Nest documentation distinguishes generator engine requirements from runtime requirements, so checking only the framework minimum is insufficient.

For persistence, Prisma, Drizzle, and TypeORM are candidates, not a request to install all three. Before selecting one, demonstrate a tenant-scoped query, a transaction spanning related writes, a tenant-aware unique/foreign-key constraint, and a reviewed migration against PostgreSQL 17. Choose the tool whose model and SQL you can explain. Defer Redis, queues, tracing infrastructure, and payment/storage SDKs until the relevant milestone needs them.

**Review checkpoint:** Present your tooling choices, module system, adapter, first module boundary, and remaining identity/data decisions. The review should identify compatibility risks before you connect dependencies.

## 2. Plan the root application boundary

The intended application lives directly at the repository root: root `package.json`, `src/`, `test/`, and `nest-cli.json`. It is not a new nested `backend/` directory. The tree below is a target you create gradually; most paths do not exist yet.

```text
TenantFlow/
|-- package.json                 # Backend scripts and dependencies
|-- package-lock.json            # Backend dependency graph
|-- nest-cli.json
|-- tsconfig.json
|-- tsconfig.build.json
|-- <lint/format/test configs>   # Match the selected template/tooling
|-- src/
|   |-- main.ts                  # Bootstrap and HTTP configuration
|   |-- app.module.ts            # Application composition
|   |-- config/                  # Typed, validated configuration
|   |-- common/                  # Small reused HTTP concerns
|   |-- infrastructure/
|   |   +-- database/            # Database provider and lifecycle
|   +-- modules/
|       |-- health/
|       |-- identity/            # Provider verification and domain mapping
|       |-- tenants/
|       +-- customers/           # Later business slice
|-- test/                        # HTTP and real-database integration tests
|-- <migration directory>/      # Chosen data tool determines the location
|-- frontend/                    # Existing independent Next.js app
|-- docs/
|-- assets/images/
|-- schemas.ts                   # Provisional reference, outside backend compilation
|-- enum.ts                      # Provisional reference, outside backend compilation
|-- .env.example                 # Existing Compose contract
|-- .env.backend.example         # Proposed example, added with real consumers
|-- docker-compose.yml          # Existing PostgreSQL + frontend
+-- README.md
```

For a feature such as customers, begin with a module, controller, service, DTOs and relevant tests. Add a policy, data adapter, or domain helper when it has a clear job. Controllers translate HTTP; services coordinate the use case and transaction; data access applies tenant predicates and constraints. Other modules consume exported providers rather than reaching into private persistence code. Do not create empty layers for every feature in advance.

Root tooling must be scoped deliberately:

- Include backend `src/` and applicable `test/` files for type checking; production compilation excludes test/spec files. Exclude `frontend/`, documentation, generated outputs, dependencies, and the provisional root models. An exclusion does not prevent an explicitly imported file from entering the program, so avoid importing the root model references as production contracts.
- Limit lint, formatting and test patterns to backend directories and selected backend configuration files. A root formatter or linter over `.` can change the frontend or documentation accidentally.
- Define production output and startup paths consistently, then verify the emitted entry point after a build. TypeScript aliases need matching runtime support; a compiler alias alone does not rewrite emitted Node imports.
- Keep strict checking enabled. If the template disables strict property initialization for decorator DTOs, understand that exception rather than weakening other checks to make errors disappear.

## 3. Establish the skeleton without overwriting the repository

Create the final root files yourself. An optional CLI draft in a fresh temporary directory can show the current official template without touching this repository's README, ignore rules or frontend. Use that draft as a reference while authoring your final files.

From the repository root in PowerShell, inspect versions first:

```powershell
node --version
npm.cmd --version
npm.cmd view @nestjs/cli version engines
npm.cmd view @nestjs/core version engines
```

Review the published versions and compatibility, then enter an exact CLI version for the draft:

```powershell
$nestCliVersion = Read-Host 'Enter the reviewed exact @nestjs/cli version'
$nestDraft = Join-Path ([System.IO.Path]::GetTempPath()) ('tenantflow-nest-' + [guid]::NewGuid().ToString('N'))
npx.cmd --package "@nestjs/cli@$nestCliVersion" nest new tenantflow-api --directory "$nestDraft" --skip-git --skip-install --package-manager npm --strict --no-observe
```

These flags follow the [Nest CLI reference](https://docs.nestjs.com/cli/usages). Check the chosen version's help if its flags differ. Choose a module system deliberately; current templates can select different test tooling for ESM and CommonJS. The optional hosted observability integration is omitted from this starting draft; choose observability services later when needed.

Inspect the draft's manifest, source, tests, compiler, lint, format and test configurations. Create the backend files at the repository root after reviewing each one. Keep the existing root README, `.gitignore`, Compose, environment example, frontend, docs and model references. Merge any needed ignore entries selectively. Do not run the generator into `.` or copy an entire template over this populated repository.

When the root package is ready, you perform the initial `npm.cmd install` to produce its lockfile; use `npm.cmd ci` for later clean reproducible installs. Review new dependencies and lifecycle scripts before installing. Keep the core Nest packages on a compatible release family and check peer requirements for integrations instead of giving every `@nestjs/*` package the same version number.

**Review checkpoint:** Share your root manifest, compiler/build/tooling configs and smallest bootable application. Check strict types, package compatibility, module wiring, backend-only globs, port separation, and startup behavior before adding database/auth modules.

## 4. Add configuration and safe HTTP behavior

Start with the smallest environment contract consumed by your application. The current root `.env` serves Compose; `frontend/.env.local` serves Next.js. A proposed `.env.backend` keeps the new API contract separate. Add `.env.backend.example` only alongside the actual Nest configuration loader and validation. Existing ignore rules already cover `.env.backend` while allowing `.env.backend.example`.

| Proposed backend setting | Purpose / validation |
| --- | --- |
| `NODE_ENV` | Deliberate development/test/production behavior |
| `PORT` | Integer port; propose `3001` for local API work |
| `DATABASE_URL` | Private PostgreSQL connection string, required once database access exists |
| `CORS_ORIGINS` | Exact parsed origin allowlist; local frontend origin is `http://localhost:3000` |
| Provider verification settings | Add the names required by the selected Stack Auth verification method, with visibility documented |

With [Nest configuration](https://docs.nestjs.com/techniques/configuration), explicitly select the backend env-file path and validate at startup. Document that deployed process variables take precedence over local files. Decide how database CLI commands load the same settings; the Nest config module does not automatically configure an external migration process. Validate custom configuration outputs as well as raw environment inputs. Never require unrelated future email/payment/queue secrets just to boot the current milestone.

Implement these HTTP concerns incrementally, using the [conventions guide](../architecture/BACKEND_CONVENTIONS.md) to place them:

1. Choose an API prefix/versioning policy, response DTOs and stable error codes. Define status codes and bounds for pagination, date/time and ID inputs.
2. Apply runtime validation globally. For class DTOs, consider `transform`, `whitelist` and `forbidNonWhitelisted`; add explicit parsing for booleans/numbers/IDs and decorators for fields. Avoid broad implicit conversion. See [Nest validation](https://docs.nestjs.com/techniques/validation).
3. Configure security headers, body-size limits, allowed origins and request IDs. Use credentialed CORS only with a matching cookie/CSRF design. Trust forwarded addresses only through known proxies.
4. Return explicit safe response shapes. Translate unexpected failures to a generic response while retaining a redacted diagnostic log and request ID. Preserve meaningful validation/authorization/conflict outcomes.
5. Register dependency-injected global guards, filters, pipes or interceptors through Nest providers where appropriate. Define guard order; guards run before parameter validation pipes.
6. Expose [OpenAPI](https://docs.nestjs.com/openapi/introduction) with request/response schemas and auth/error examples. Limit public documentation access deliberately in deployed environments.

Add the configuration, validation and OpenAPI dependencies compatible with your selected release when implementing these consumers. Retain the generated test/lint tools if suitable. Choose one configuration-validation strategy and one request-validation strategy you understand; avoid parallel validation frameworks without a reason.

**Review checkpoint:** Prove startup rejects invalid configuration; malformed and unknown request fields fail predictably; returned objects contain only allowed fields; allowed frontend calls work. Apply the same HTTP setup in tests so they exercise the deployed behavior.

## 5. Establish persistence and operational health

Start the existing database using the [PostgreSQL guide](POSTGRESQL_SETUP.md). An API running on your host connects to `localhost:5432`; a future API container on the Compose network connects to `postgres:5432`. Reuse the existing database/volume configuration. Use a separate disposable test database, never your development data, for destructive test setup.

Implement a database provider with one shared client/pool per process and graceful cleanup. Size the pool against deployment instance counts and database limits. Application services coordinate transaction boundaries; data access must use that transaction rather than accidentally opening independent operations.

Before the first migration:

- Reconcile the naming/constraint candidates in [backend requirements section 2](../requirements/BACKEND_REQUIREMENTS.md#2-data-integrity-and-lifecycle). Decide UUID generation, UTC timestamp behavior, enum storage, and each deletion policy.
- Document tenant-owned versus global tables. Add tenant-aware indexes, unique constraints and relationships that prevent cross-tenant parent/child links. Include tenant identity in every affected query, mutation, join and bulk operation.
- Review generated SQL. Disable automatic schema synchronization in deployed environments. Apply versioned migrations as a controlled release step, with backup/recovery and compatible rollout plans for destructive changes.
- Prove migrations work from an empty database and from the prior supported schema. Verify database constraints and rollback-on-failure using the real PostgreSQL library; mocks cannot establish those guarantees.

Add liveness and readiness with defined semantics; proposed routes such as `/health/live` and `/health/ready` are targets, not current endpoints. Liveness reports whether the process is functioning and should not fail merely because PostgreSQL is temporarily down. Readiness checks the dependencies needed to serve current traffic with bounded timeouts and returns non-success when unavailable. Keep health responses free of credentials and internal diagnostics. [Nest Terminus](https://docs.nestjs.com/recipes/terminus) is an optional integration, not a substitute for defining these semantics.

Enable shutdown handling so traffic stops, work drains within a bounded interval, and database/external clients close. Start structured, redacted logging now; introduce request/operation duration, outcome and trusted tenant context as those become available.

**Review checkpoint:** Show migration SQL, schema constraints, transaction behavior, readiness failure/recovery, and shutdown results. Document the command and observed outcome instead of checking off a feature because a file exists.

## 6. Build identity and tenant authorization before business CRUD

Keep provider identity separate from TenantFlow permissions. Do not begin by implementing password hashing, a new JWT issuer, or a parallel refresh-token store just because a generic Nest tutorial does so.

1. Record which Stack Auth protocol/SDK the API will use to verify credentials, including expiry, intended audience/issuer where relevant, key rotation or session checks, and revocation behavior. Use provider documentation matching the actual frontend integration.
2. Map provider user IDs to domain user IDs explicitly; map provider teams to tenants and memberships. Provider IDs are not assumed to be UUIDs. Define synchronization, deleted accounts/teams, suspended members, and stale membership behavior.
3. Authenticate first, validate tenant selection, check current membership, then enforce permissions and resource policy. A tenant header or selected UI team is untrusted until authorized. Guards using route IDs must validate those values before parameter pipes run, or defer that resource check to a validated application input.
4. Pass a typed trusted actor/tenant context into application operations. Never keep the current actor/tenant in mutable singleton fields. Jobs and scripts must establish their own verified context.
5. Enforce tenant scope again in data access and database relationships. Treat platform-wide admin access as an explicit separate permission path. Decide whether inaccessible resources return 403 or 404 and test that policy consistently.

**Review checkpoint:** Use two tenants, an actor belonging to one, and resources in both. Verify unauthenticated requests, forged tenant selection, missing membership, forbidden permissions, resource-ID substitution, and a legitimate request. Check list, read, update, delete and parent/child assignment paths as they are implemented. Include permission/membership revocation and output-field exposure checks.

## 7. Deliver one feature end to end

After the foundation and identity/tenancy boundaries, follow the [roadmap](../planning/ROADMAP.md) one milestone at a time. A narrow tenant-owned customer operation is a useful business slice when its milestone is reached; the setup guide does not reorder product commitments.

For that operation, you write the validated request DTO, thin controller, service, permission policy, tenant-scoped persistence, safe response mapping, relevant audit entry, migration and tests. Implement the smallest complete behavior, including failure paths and concurrency rules. A read-then-write check alone cannot protect uniqueness or plan limits under concurrent requests.

Add integrations when their milestones need them: signature verification over required raw webhook bytes, durable deduplication and idempotent billing transitions; authorized file metadata/storage; notification preferences and retry visibility. Use durable jobs or an outbox only when the operation's delivery guarantees require them. A successful SDK request does not establish durable business execution.

## 8. Define checks and automation with real source

Create root scripts with these responsibilities; exact underlying commands follow your selected tooling. The generated `lint` command may auto-fix, so make the CI variant explicitly read-only. A test command used in CI must run once and fail on failures, rather than start watch mode or merely print a message.

| Root script | Required behavior |
| --- | --- |
| `start:dev` | Start only the backend in watch mode using documented local configuration |
| `build` / `start:prod` | Compile backend source / run its verified emitted entry point |
| `typecheck` | Type-check backend and applicable test inputs without emitting files |
| `lint:check` / `format:check` | Report backend violations without modifying files |
| `test:unit` | Run meaningful policy/service tests once |
| `test:integration` | Exercise real PostgreSQL queries, constraints, migrations and transactions against a separate test database |
| `test:e2e` | Exercise assembled HTTP authentication, tenant authorization, validation and response/error contracts |
| Migration scripts | Load the documented config and operate through the selected tool; distinguish generation, review and deployment |

Once you have implemented the scripts, your routine checks from the repository root should include:

```powershell
npm.cmd run typecheck
npm.cmd run lint:check
npm.cmd run format:check
npm.cmd run test:unit
npm.cmd run test:integration
npm.cmd run test:e2e
npm.cmd run build
```

These scripts do not exist yet. Run integration/e2e checks only with isolated test configuration and required services. Frontend checks remain separate under `frontend/`; its existing `npm test` placeholder does not validate backend or product behavior.

When local behavior is verified, you add a backend CI job with root lockfile caching, locked install, read-only lint/format checks, types, unit tests, real PostgreSQL migration/integration checks, HTTP tests and build. Extend change detection to cover root backend files, shared infrastructure and any schema/migration inputs. Preserve the existing frontend and PostgreSQL jobs.

Add a backend Dockerfile only when source and production startup exist. Use a reproducible build, a minimal runtime with production dependencies, non-root execution, explicit shutdown/health behavior, and secret-safe build contexts. Because the backend lives at root, its Docker context needs explicit exclusions for frontend assets/dependencies, local env files, test output and `.git`. Add the real API service/port to Compose together with its environment contract, readiness and startup documentation. Do not add a service pointing to missing files or run migrations concurrently in every application replica.

## 9. Use small review checkpoints

Finish and review one step before broadening scope:

| Batch | What you provide | What the assistant reviews |
| --- | --- | --- |
| Tooling and skeleton | Chosen versions, root package/configuration, minimal boot, observed checks | Compatibility, application boundaries, module system and scripts |
| HTTP foundation | Configuration, validation, error handling, OpenAPI, health behavior | Failure semantics, sensitive output, bootstrap/test parity |
| Persistence | Data-library choice, migration SQL, queries/transactions, real database results | Tenant-safe constraints, lifecycle rules, atomicity and rollout |
| Identity and tenancy | Provider decision, mappings, guards/policies, two-tenant tests | Credential validity, trusted context, authorization and isolation gaps |
| First feature | Contract, implementation, tests, logs/audit and actual results | Requirements coverage, correctness, maintainability, operational limits |

For each review, provide the intended behavior, changed paths or diff, commands you ran and actual results, and any specific uncertainty. The assistant should return concrete findings with severity and file/line references, explain why they matter, and describe corrections you can implement. It may update documentation or perform suitable read-only checks; you keep ownership of backend code and configuration edits. Generated builds, schema writes, dependency installs and auto-fixes remain commands for you to run.

Track completion in the [roadmap](../planning/ROADMAP.md), accepted choices in architecture decision records, and remaining manual verification in [Validation and Follow-ups](../planning/VALIDATION.md). A setup document or scaffold alone does not complete the foundation milestone.

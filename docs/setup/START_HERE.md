# Start Here

TenantFlow's backend is being restarted from requirements for NestJS. There is no backend application, migration runner, or API service to launch. The existing Next.js frontend starter and optional PostgreSQL container remain available for local work.

## Read the requirements

1. Read the [SRS](../init/TenantFlow-SRS.md) for the product, tenant isolation, permissions, billing, and data-retention rules.
2. Review [backend requirements and design notes](../init/BACKEND_REQUIREMENTS.md), including preserved constraint candidates and identity decisions.
3. Compare the [schema references](../../schemas.ts) and [enums](../../enum.ts). They are provisional models, not database migrations or runtime validation.
4. Follow the [implementation roadmap](../init/ROADMAP.md) and [cleanup tracker](../../BACKEND_CLEANUP_PLAN.md). Release dates and old milestone checkboxes are not proof of implementation.

The frontend currently uses Stack Auth for users, sign-in, account management and teams. NestJS credential verification, provider-to-domain user mapping, team-to-tenant mapping, identifier compatibility, and server authorization remain requirements to design. Frontend team selection alone does not enforce backend tenant isolation.

## Run the existing frontend locally

Prerequisites: Git, Node.js 22 (matching the existing frontend CI/container), npm, and a configured Stack Auth project. These are frontend tooling choices, not a selected backend runtime contract.

From the repository root:

```powershell
if (!(Test-Path frontend/.env.local)) { Copy-Item frontend/.env.local.example frontend/.env.local }
```

Fill in `frontend/.env.local` with your project's public identifiers and private server key, then run:

```powershell
Set-Location frontend
npm ci
npm run dev
```

The starter's team-creation flow also needs client team creation enabled in the Stack Auth project. See the [frontend README](../../frontend/README.md) and [environment guide](ENV_AND_GITIGNORE_SETUP.md). In Windows PowerShell sessions that block `npm.ps1`, use `npm.cmd` for these commands; no execution-policy change is needed.

Open `http://localhost:3000`. The dashboard contains demo figures and placeholder pages; customer/project/task/billing APIs are not implemented.

## Optional development database

Docker with Compose is required only for the PostgreSQL container and optional container work. From the repository root:

```powershell
docker compose up -d --wait --wait-timeout 90 postgres
```

See the [PostgreSQL guide](POSTGRESQL_SETUP.md) for connection checks, DBeaver, and persistent-data handling. Starting the database does not create TenantFlow business tables. The frontend starter does not use this database directly.

## Containers and checks

The frontend Dockerfile declares both public build arguments and consumes the private key through a BuildKit secret during `next build`. Compose supplies these at build time and the three settings at runtime. Local env files and generated/dependency directories are excluded from the build context by `.dockerignore`.

For container work, use Docker with a working Linux engine, BuildKit/buildx, and Compose supporting environment-sourced build secrets. From the repository root, create root `.env` from `.env.example` if absent and populate it with the same project's settings. Then:

```powershell
docker compose config --quiet
docker compose up -d --build frontend
```

Changing browser-public project settings requires rebuilding the image. See the [environment guide](ENV_AND_GITIGNORE_SETUP.md) for the exact build/runtime contract and references.

Frontend checks, from `frontend/`, are `npm run lint`, `npx tsc --noEmit`, and `npm run build`. The `npm test` script only prints a message and provides no test coverage. CI checks lint/build, builds the frontend image, renders Compose and waits for PostgreSQL before an actual SQL connection check; services are stopped afterward without deleting volumes. There are no backend checks to run.

**Verification boundary:** Node.js 22 lint/type checks, a production build with explicit fake credentials, development startup and production HTTP smoke checks passed locally. Compose rendering passed with placeholders and the empty example file. Corrected hosted CI passed frontend lint/build, PostgreSQL readiness/SQL, and image build/start/HTTP smoke, including cleanup. Real sign-in/team/account flows remain unverified and need a configured project. See the [final evidence and follow-ups](../../BACKEND_CLEANUP_PLAN.md#10-step-7-pr-handoff); historical failed runs are retained there.

Before backend implementation, settle the decisions in the backend requirements document, then add real source, migrations, API contracts, configuration, health checks, and tests together. Do not add a service or a setup command for a backend that does not exist.

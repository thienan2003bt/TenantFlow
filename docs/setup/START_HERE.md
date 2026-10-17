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
Copy-Item frontend/.env.local.example frontend/.env.local
Set-Location frontend
npm ci
npm run dev
```

Fill in `frontend/.env.local` with your project's public identifiers and private server key before running the app. The starter's team-creation flow also needs client team creation enabled in the Stack Auth project. See the [frontend README](../../frontend/README.md) and [environment guide](ENV_AND_GITIGNORE_SETUP.md).

Open `http://localhost:3000`. The dashboard contains demo figures and placeholder pages; customer/project/task/billing APIs are not implemented.

## Optional development database

Docker with Compose is required only for the PostgreSQL container and optional container work. From the repository root:

```powershell
docker compose up -d postgres
```

See the [PostgreSQL guide](POSTGRESQL_SETUP.md) for connection checks, DBeaver, and persistent-data handling. Starting the database does not create TenantFlow business tables. The frontend starter does not use this database directly.

## Containers and checks

Compose retains a frontend build, but its existing Dockerfile's Stack Auth build-time configuration handoff still needs verification. CI passes build arguments the Dockerfile does not declare, and Compose supplies runtime variables. Use the local frontend workflow above until that handoff is fixed and tested; do not treat the container path as verified onboarding.

Frontend checks, from `frontend/`, are `npm run build` and `npm run lint`; they may need configuration or reveal existing template issues. The `npm test` script only prints a message and provides no test coverage. Current CI retains frontend build/image checks and adds Compose configuration validation for related changes. There are no backend checks to run.

Before backend implementation, settle the decisions in the backend requirements document, then add real source, migrations, API contracts, configuration, health checks, and tests together. Do not add a service or a setup command for a backend that does not exist.

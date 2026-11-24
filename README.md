# TenantFlow

TenantFlow is a B2B workspace project for organizations, members, customers and project work.
It is also a portfolio project for learning application-owned authentication and tenant-safe backend design.

## Current application

The NestJS backend uses PostgreSQL, TypeORM and Argon2id.
It supports protected registration, strict DTO validation and a bundled password blocklist.
Registration creates a pending account; it does not log the user in or send verification email.

The Next.js frontend still uses its inherited Stack Auth integration.
Its registration form does not call the new backend endpoint.
Template dashboards are not evidence of completed business APIs.

## Run locally

Use the [backend guide](backend/README.md) for configuration, startup and browser checks.
Use [Start Here](docs/setup/START_HERE.md) for the frontend and development PostgreSQL service.
Preserve local environment files and existing PostgreSQL volumes.
Schema changes follow the [migration workflow](backend/src/database/migrations/README.md).

## Repository

- backend/: Nest application, migrations and backend tests.

- frontend/: independent Next.js application and template assets.

- docs/: product requirements, architecture and setup documentation.

- schemas.ts and enum.ts: model references, not executable migrations.

## Understand the design

The [documentation index](docs/README.md) helps you find the right guide.
The [SRS](docs/requirements/TenantFlow-SRS.md) owns product scope.
[Backend requirements](docs/requirements/BACKEND_REQUIREMENTS.md) own the accepted auth contract.
[Backend conventions](docs/architecture/BACKEND_CONVENTIONS.md) explain responsibility placement.

Tenant-owned access must check membership and permissions on the server.
A selected organization in the UI does not authorize a request.

## Verification and direction

From backend/, run npm.cmd run check for static checks, HTTP tests and the build.
Run npm.cmd run test:db for the disposable PostgreSQL integration suite.
The [coverage summary](docs/planning/VALIDATION.md) distinguishes automated evidence from browser/hosted behavior.

The [roadmap](docs/planning/ROADMAP.md) shows the delivery sequence.
Swagger/OpenAPI is a possible next PR, not part of registration.
Hosting and frontend auth replacement are separate from the local registration feature.

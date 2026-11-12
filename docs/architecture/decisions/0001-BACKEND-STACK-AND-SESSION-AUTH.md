# ADR 0001 — Backend stack and session authentication

- **Date:** 23 October 2026
- **Status:** Accepted by the developer; new integrations are not implemented or runtime-verified.
- **Scope:** Backend persistence and the first registration/login/caller/logout slice.
- **Related:** [Backend conventions](../BACKEND_CONVENTIONS.md), [backend requirements](../../requirements/BACKEND_REQUIREMENTS.md), [temporary development tracker](../../SESSION_AUTH_DEVELOPMENT_PLAN.md), [roadmap](../../planning/ROADMAP.md#current-priorities-and-learning-preferences).

## Context

TenantFlow is a portfolio project for comprehensive backend learning, including practical ORM experience. The existing application is Nest 12 with Express, TypeScript/NodeNext ESM, npm, class-validator/class-transformer, ConfigModule, Vitest and Supertest. PostgreSQL 17 exists in Compose. The frontend still contains inherited Stack Auth; replacement is later work.

The developer accepted the proposed stack after comparing TypeORM, MikroORM, Prisma, Drizzle and related session/tooling alternatives. Selection is based on the desired programming model and learning scope, not an asserted global or Vietnamese market-share percentage. Hosting remains a comparison of effective price/capability across suitable providers rather than a Cloudflare-only requirement.

## Decision

| Concern | Selected approach | Implementation boundary |
| --- | --- | --- |
| Application | Retain NestJS with Express, npm, ESM/NodeNext and strict TypeScript. | Keep package/configuration/source/tests inside `backend/`. Preserve the existing alias/build conventions. |
| Persistence | PostgreSQL through TypeORM, `@nestjs/typeorm` and the `pg` driver. Use Data Mapper/repository style. | Application services coordinate workflows; entities map persisted state and do not become Active Record workflow owners or API DTOs. |
| Schema changes | TypeORM migrations with reviewed SQL; automatic schema synchronization disabled for the actual development/deployment workflow. | Keep one migration history. The standalone CLI DataSource and Nest runtime share deliberate entity/connection settings; migration generation is a developer action. |
| Authentication | Application-owned opaque sessions stored in PostgreSQL, resolved by a small session service and Nest guard. | Persist only a digest of the random session secret; raw credentials stay in an HttpOnly cookie. Sessions do not permanently encode tenant membership or role grants. No Passport or express-session dependency is required initially. |
| Passwords | Argon2id through a maintained implementation, behind a password service. | Benchmark parameters on the chosen runtime and keep hashing/verification separate from transport and persistence. Do not implement cryptographic primitives. |
| Inputs/configuration | Retain class-validator/class-transformer DTO validation and `@nestjs/config` with startup validation. | Explicit response contracts; no automatic entity serialization or exposure of hashes/internal relationships. |
| API safeguards | `@nestjs/swagger`, Helmet and `@nestjs/throttler`, introduced with the corresponding consumers. | Define cookie/origin/CSRF/body-limit and abuse policies before the auth routes are exposed. None of these packages replaces authorization. |
| Logging | Nest's built-in structured JSON logger first. | Redact credentials and sensitive bodies; add request correlation deliberately. Pino is a future option when justified, not a second logger to install now. |
| Verification | Retain Vitest, `@nestjs/testing` and Supertest; test persistence with isolated real PostgreSQL. | Add actual browser checks for cookie/CSRF behavior. Dedicated Compose test storage or Testcontainers may provide isolation; exact automation remains open. |
| Initial operations | One modular monolith and PostgreSQL-backed sessions. | Redis, queues, a managed load balancer and an additional auth framework are not prerequisites. Preserve the existing PostgreSQL volume and frontend assets/license. |

## Persistence and ownership rules

1. Use feature-colocated entities and injected TypeORM repositories. Add custom query adapters only where a useful query/contract needs them; do not mechanically wrap every repository method.
2. Put runtime database wiring and the standalone migration DataSource under `backend/src/database/`. Connection/entity settings must not drift between them. Avoid loading both source and compiled copies of an entity or migration.
3. Services own transaction boundaries. Use repositories/managers attached to the transaction for all participating operations; injected default repositories do not implicitly join it. Compute password hashes before opening a database transaction.
4. Review uniqueness, foreign keys, timestamps and history retention explicitly. A read-before-insert check alone does not prevent concurrent duplicate registration. Use conditional persistence for session renewal/revocation so stale requests cannot restore a revoked session.
5. Begin with user, password-credential and session persistence only. Keep identity global; tenant memberships and permissions are separate future domain records. Root TypeScript model references are not executable schema definitions.
6. Keep HTTP handling in controllers, DTO validation at the boundary, password work in a password service, session lifecycle in a session service and session resolution in a guard. The guard must not assume handler pipes have already validated its inputs.

## Alternatives and consequences

- **Prisma:** generated client and schema-first tooling remain useful alternatives. Not selected because this project now prioritizes entity/repository ORM experience; the earlier Prisma implementation outline is superseded and its commands must not be followed for this branch.
- **MikroORM:** its Identity Map and Unit of Work are attractive learning topics. TypeORM was selected for the present repository-style approach; changing to MikroORM would be a new architecture decision.
- **Drizzle / SQL query builders:** retain SQL-oriented control and type inference, but a different persistence model from the selected entity/repository approach. Raw SQL remains available for justified PostgreSQL-specific work without introducing a second ORM.
- **Sequelize:** viable for an existing Sequelize stack; not selected for this new feature.
- **express-session plus a PostgreSQL store / Passport:** reduce or standardize some session/strategy plumbing. Not selected initially because explicit session persistence/lifecycle is part of the learning objective. The custom service must therefore receive meaningful security, concurrency and browser tests.
- **Managed/full auth frameworks:** remain possible future alternatives but would transfer account lifecycle behavior out of the current learning scope.

The selected stack adds entity metadata, relation-loading and transaction-context responsibilities. Migration SQL, queries, connection limits and indexes must be understood and reviewed. TypeORM does not enforce TenantFlow's tenant boundaries, permissions or account lifecycle automatically. DTOs remain separate even when entity decorators resemble validation decorators.

## Open details and acceptance checks

- Select released TypeORM/adapter/driver versions compatible with Nest 12, TypeScript 6 and ESM; validate type-check, Nest build/watch, compiled startup and Vitest before extending the schema. Repository manifests are supporting compatibility evidence, not a verified installed combination.
- Settle exact email/password input rules, pending-verification behavior, endpoint/status/error contracts, session duration/renewal/retention, cookie topology and CSRF strategy in the temporary tracker. Accepting this stack does not silently accept every previously proposed value.
- Finalize migration scripts/source-versus-compiled CLI invocation, isolated test database targeting and readiness behavior alongside actual integration. A migration directory or schema comment is not proof of execution.
- Verify atomic user/credential writes, concurrent normalized-email uniqueness, session lookup/expiry/revocation/renewal, connection cleanup and safe response/log fields against real PostgreSQL.
- Hosting providers, frontend Stack Auth replacement, delivery infrastructure, RLS, shared rate-limit storage and future queues remain explicit later choices. No provider accounts or runtime quotas were validated by this decision.

The [validation register](../../planning/VALIDATION.md#open-follow-ups) owns actual evidence and outstanding checks. No packages, entities, migrations, feature source or tests were created by this decision record.

## Affected requirements and references

This decision supports SRS [authentication](../../requirements/TenantFlow-SRS.md#51-authentication), [security](../../requirements/TenantFlow-SRS.md#61-security), [maintainability](../../requirements/TenantFlow-SRS.md#63-maintainability), [reliability](../../requirements/TenantFlow-SRS.md#64-reliability) and [core data rules](../../requirements/TenantFlow-SRS.md#71-core-design-rules). It does not reduce the required verification, recovery, renewal/revocation, tenant-isolation or historical-data outcomes.

Research sources: [Nest TypeORM integration](https://docs.nestjs.com/data/typeorm), [TypeORM repository APIs](https://typeorm.io/docs/working-with-entity-manager/repository-api/), [Nest cookies](https://docs.nestjs.com/techniques/cookies), [CSRF](https://docs.nestjs.com/security/csrf), [validation](https://docs.nestjs.com/techniques/validation), [security headers](https://docs.nestjs.com/security/helmet), [rate limiting](https://docs.nestjs.com/security/rate-limiting), [OpenAPI](https://docs.nestjs.com/openapi/introduction), [logging](https://docs.nestjs.com/techniques/logger), [testing](https://docs.nestjs.com/fundamentals/testing), [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) and [password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). The previously reviewed [Prisma ESM issue](https://github.com/prisma/orm/issues/29710) and [Drizzle D1 transaction discussion](https://github.com/drizzle-team/drizzle-orm/issues/2463) illustrate version/driver-specific compatibility concerns; neither establishes a TypeORM defect or runtime validation of this project.

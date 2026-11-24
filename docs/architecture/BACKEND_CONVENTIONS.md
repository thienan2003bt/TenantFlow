# Backend engineering conventions

Use these conventions when changing backend/.
The [stack decision](decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) explains the selected architecture.
The [backend guide](../../backend/README.md) owns commands and current runtime behavior.

## Responsibilities

Keep controllers thin, services focused on workflows, and database constraints responsible for durable invariants.
Group code by feature using Nest's ordinary colocated structure.
An endpoint does not automatically need a separate service.

- Middleware: early transport checks and request context.

- Guard: admission, authentication or authorization.

- Pipe/DTO: runtime shape/value validation.

- Controller: route and response contract.

- Service: policy, orchestration and transaction ownership.

- Repository/adapter: persistence queries or external integration.

- Filter: safe error-to-HTTP mapping.

The local setup runs security/media/body checks before the registration guard.
Guards run before pipes, so throttling can reject work before validation, hashing or persistence.
Global filters handle early failures; route-scoped filters do not receive every middleware error.
Await request work so failures reach its error boundary. Detached work needs separate lifecycle management.

## Inputs and responses

Use concrete DTO classes imported as runtime values with the global validation pipe.
Share email/password rules across transports. Do not coerce credential types or trim passwords.
Unknown fields must be rejected, not silently discarded.

A transport guard does not protect direct service calls.
Non-HTTP registration callers use RegisterDto.fromUnknown.
The blocklist remains registration policy in the service.

Return deliberate response objects, not ORM entities.
Never expose password hashes, session digests, token hashes, raw query parameters or unrestricted request bodies.
Keep account-existence disclosures consistent with the auth contract.

## Identity and tenant access

The backend owns local identity. The inherited frontend provider is a separate integration.
Authentication identifies an actor; membership and permissions establish tenant access.
Scope lookups and mutations, including children reached through a parent.

A supplied tenant ID, selected UI organization or hidden control is not authorization.
Use database constraints to prevent cross-tenant references where required.
Check account eligibility and session validity on the server.

## Data and side effects

Use TypeORM repositories/Data Mapper, PostgreSQL and reviewed migrations.
Keep schema synchronization and automatic startup migrations disabled.
Related writes must use one transaction manager.

Use uniqueness, locks or atomic operations when concurrency can violate an invariant.
A read-then-write precheck alone does not establish uniqueness or resource limits.
Hash before the registration transaction; keep slow external calls outside transactions where possible.

Read the [migration guide](../../backend/src/database/migrations/README.md) before schema operations.
Retry state-changing integrations only with an idempotency strategy.
Database writes and queue enqueues are not atomic unless deliberately coordinated.
Webhook consumers must verify signatures and deduplicate deliveries.

## TypeScript and operations

Preserve explicit variable types, including readable types on new declarations.
Use braced multiline conditionals, double-quoted imports, two-space indentation and backend Prettier settings.
Do not use assertions or any to conceal an unresolved contract.

Retain ESM/NodeNext and the selected source alias mapping.
Build with Nest; plain tsc does not perform the same alias rewrite.
Verify relevant runtime paths before changing compiler, alias or module settings.

Keep backend configuration/tests independent from the frontend package.
Validate required configuration at startup, protect secrets and manage client lifecycles through providers.
Distinguish process liveness from readiness. Introduce infrastructure only for a consuming requirement.

## Verification

Use unit tests for policies, HTTP tests for transport behavior and real PostgreSQL for database guarantees.
Mock boundaries without mocking away the behavior being claimed.
Browser behavior requires browser evidence; a build or HTTP smoke does not prove a complete auth flow.

Report what ran and its limitations. Keep work plans and review discussion in the chat.
Update current explanations instead of appending work logs or proposed-case inventories.

# Backend Requirements and Design Notes

The backend is starting again from requirements. NestJS is the chosen direction; there is no backend implementation, dependency matrix, migration runner, API endpoint, or backend container in this checkout. The existing frontend remains a Stack Auth starter and is not evidence that these backend requirements are implemented.

Use the [SRS](TenantFlow-SRS.md) for product rules, [schema references](../../schemas.ts) and [enums](../../enum.ts) for the provisional model vocabulary, and [roadmap](ROADMAP.md) for implementation sequencing. This document preserves backend-specific design knowledge and unresolved decisions from retired tutorials; it does not prescribe a finished architecture.

## 1. Boundaries and identity ownership

- Keep business rules independent of HTTP handlers, persistence details, storage providers, and payment/email SDKs. Separate request/response contracts from stored entities; introduce abstractions where they make an integration replaceable or a boundary testable.
- The frontend currently uses Stack Auth for sign-in, account management, and teams. Decide how the future API verifies provider credentials, maps provider users to domain users, and maps teams to tenants and memberships. Never trust a client-supplied tenant ID without checking membership and permissions.
- Global user identities and platform roles differ from tenant-owned memberships and tenant/project roles. A global identity must not grant access to every tenant.
- Root model references use UUIDs. Provider IDs must not be assumed to be compatible with those UUIDs. Record the mapping, synchronization, ownership, and account-deletion behavior before implementation.
- User identity, profile, session, authentication-factor, and verification/reset-token concepts are represented by `User`, `UserIdentity`, `UserProfile`, `UserSession`, `AuthFactor`, and `UserToken`. Preserve those outcomes even if a provider owns some records. Do not duplicate provider password/session storage without a reason.
- The five `UserStatus` values remain `active`, `inactive`, `pending_verification`, `frozen`, and `deleted` in the root enum reference. Authentication factors and verification/reset/MFA token types are also preserved there. MFA is a future extension in the SRS; its release placement still needs reconciliation with version planning.

## 2. Data integrity and lifecycle

The SRS sections 7-8 remain authoritative for tenant boundaries, UUIDs, foreign keys, explicit join tables, soft deletion, and retained history. Validate a tenant-owned child through its parent as well as its own identifiers. System-level records may have no tenant; this must be explicit rather than an unscoped query exception.

The following details appeared in tutorial mappings. Preserve them for design review, not as automatically approved constraints:

| Topic | Candidate retained for review | Decision required |
| --- | --- | --- |
| User identifiers | Required email and slug, unique indexes, candidate maximum 255 characters each. | Define email normalization and uniqueness scope consistently with the identity provider. Confirm slug generation and collision behavior. |
| Role/permission vocabulary | Required scope and name; candidate scope length 50, name length 255, description required. | Enforce system/tenant/project scope consistency with nullable tenant/project references and assignment boundaries. |
| Role joins | Unique `(role_id, permission_id)` and `(user_id, role_id)` pairs. | Add appropriate uniqueness for tenant/member/project assignment joins and prevent cross-scope assignments. |
| External identities | Candidate unique `(provider, provider_user_id)`; provider length 50, provider user ID length 255. Local credentials were modeled with a nullable provider. | Define local/provider identity uniqueness and null behavior explicitly; do not rely on a nullable unique index alone. |
| Sessions | Store a refresh-token hash when TenantFlow owns refresh tokens; active/expiry/revocation state, IP, user agent, device, and timestamps. Candidate lengths: IP 45, user agent 500, device 255. | Define expiry, revocation and rotation policy, retention, and provider ownership. Nullable expiry in a reference model is not approval for unbounded sessions. |
| Authentication factors | Type, display name (candidate length 255), enabled/primary flags, verification/last-used timestamps, and provider-specific metadata modeled as JSONB. | Protect secret metadata and decide which factors the identity provider manages. |
| User profiles | Optional first/last name (100 each), phone (20), location (255), bio (500), avatar URL (500); one profile per user. | Recheck lengths and one-to-one uniqueness against product/provider needs; these were example limits. |
| Verification/reset tokens | Hash, purpose, expiry, used/revoked timestamps. A tutorial proposed one unused/unrevoked token per user and purpose. | Decide whether that limit is needed and how expiry/reissue works. The old filtered-index example is not portable SQL and must not be reused as a migration. |
| UUIDs and enum storage | UUID primary keys and stable lifecycle strings. | Choose application/database UUID generation deliberately; never rely on retired language enum ordinals. |
| Timestamps | Creation/update/deletion timestamps and UTC semantics. | Decide timezone-aware storage and who updates `updated_at`; a default alone does not update it on writes. |
| Deletion | Tutorial examples cascaded profiles, identities, sessions, factors, tokens and role joins, and cleared an optional primary role reference. | Reconcile every foreign key with SRS historical-data rules. Do not cascade-delete audit/billing history or bypass soft-deletion and retention policy. |

The root model files remain design references, not migrations or runtime validators. Known naming issues include comments referring to `Project.id` and `UserMembership.id` where types are named `TenantProject` and `TenantMembership`. The combination of `User.role_id`, system-role assignments, and membership/project-role assignments needs one consistent authorization model. Resolve these before implementing persistence; they were not silently redesigned during cleanup.

## 3. API and security requirements

- Account lifecycle outcomes include registration, verification, sign-in/out, session renewal/revocation, password reset/change, and future MFA. Decide which operations delegate to the provider before defining API routes.
- Validate incoming data at the API boundary and enforce domain invariants in services and database constraints where practical. Keep validation, authentication, authorization, missing-record, and unexpected-failure outcomes distinguishable without disclosing sensitive internals.
- Return explicit response contracts. Never serialize password hashes, refresh-token hashes, verification/reset-token hashes, authentication secrets, or internal entity relationships directly to clients. Email/profile exposure must respect the caller's permissions.
- Use supported password/token handling from the chosen identity system or a reviewed library. Retired tutorial hashing parameters and custom token-service examples are not a security design to port.
- Use HTTPS for production traffic and avoid sensitive-data logging; local debugging instructions must not expose credentials or token contents.
- Enforce tenant isolation and permission checks for reads and writes, including nested resources, list/filter endpoints, assignment joins, and file access. UI visibility and frontend team selection do not enforce API authorization.
- Common lists need pagination/filtering and tenant-aware indexes. Preserve append-only audit records with actor, tenant, target, action and time; consider safe old/new-value metadata without logging credentials.
- Keep API contracts documented with OpenAPI and a discoverable exploration interface when implemented. Add liveness/readiness and database connectivity checks as real endpoints with defined behavior; no routes are advertised yet.
- Plan structured, redacted logs, correlation, diagnosable errors, optional tracing/metrics, rate limiting, and tests for tenant isolation, permissions, session lifecycle and integration boundaries. Libraries and endpoint paths remain undecided.

## 4. Integrations and operations

- Retain PostgreSQL as the planned database. Host processes use its published local port; containers on the Compose network use the service hostname. Schema changes need versioned migrations and an explicit verification procedure once persistence exists.
- Keep outbound integration clients bounded by timeouts and appropriate retry/circuit-breaking policies. Retry state-changing calls only with an idempotency strategy.
- Retain billing plans/limits, provider webhook verification and idempotency, append-only billing history, and test-mode payment integration. Stripe remains the planned provider in the SRS; never handle raw card data. No payment SDK is selected by this cleanup.
- Keep email verification/reset/invitation delivery requirements and optional later notification delivery. Notification preferences, read state, and tenant-aware records must work independently of any optional live-push transport.
- Store file metadata and ownership in PostgreSQL; keep binaries behind a storage boundary, with local storage possible for development and object storage later. Preserve size/type validation and authorized download requirements.
- Plan lightweight background processing before durable scheduling. Notification delivery, retry behavior and webhook work must remain traceable and recoverable. Choose scheduling/queue tools only when needed.
- Keep caching optional: tenant-aware keys, appropriate invalidation, local in-memory lookups where useful, and a distributed cache only when justified. Redis, mail-testing services, durable workers, live-push transports and tracing infrastructure are not configured in this checkout.
- Use environment configuration with startup validation and managed deployment secrets when implemented. Database, identity, email, storage and billing settings need actual consumers before they become required variables. Separate environment credentials and never expose server secrets through browser-public variables or logs.

## 5. Decisions before implementation

1. Resolve product scope conflicts in the SRS and release planning without treating old dates or checkboxes as completed delivery.
2. Choose NestJS runtime/package tooling, module boundaries, persistence/migrations, and request validation with supported versions when implementation begins.
3. Define provider identity verification, user/team/tenant mappings, permissions, lifecycle ownership, and identifier compatibility.
4. Review the data-integrity candidates above and produce a consistent schema/ERD with tenant-aware constraints and retention rules.
5. Define the first API contracts, environment contract, startup commands, health checks, container/CI wiring and meaningful tests alongside the actual backend source.

Until those decisions and implementation exist, the supported local work is requirements/model review, the existing frontend starter, and optional PostgreSQL development storage. See [START_HERE](../setup/START_HERE.md).

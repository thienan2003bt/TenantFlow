# ROADMAP

This roadmap tracks the implementation of TenantFlow from architecture decisions to public deployment. The file is meant to stay current and should be updated whenever a milestone changes status.

**Authoring and location (2026-10-18):** The developer implements NestJS inside `backend/`, beside `frontend/`; the assistant provides researched guidance/reviews and explicitly requested tooling changes. The minimal application has passed compiled/watch startup and HTTP health smoke. The [backend README](../../backend/README.md) owns current commands, configuration and test coverage. This does not complete Milestone 1's broader database, API documentation or frontend-integration criteria.

**Historical restart baseline (2026-10-17):** Before the minimum NestJS setup, the backend had requirements and design references only. A Next.js/Stack Auth frontend scaffold, PostgreSQL Compose configuration, and CI definitions were retained. Their presence does not satisfy the API, migration, isolation, or end-to-end exit criteria below. Use [backend requirements](../requirements/BACKEND_REQUIREMENTS.md) for open decisions and [validation evidence and follow-ups](VALIDATION.md#recorded-foundation-checks) for retained verification evidence. Release dates in version planning are original estimates awaiting review.

The [canonical SRS release boundaries](../requirements/TenantFlow-SRS.md#24-canonical-release-boundaries) govern MVP versus future scope. The [version plan](releases/1.0.0/VERSION-PLANNING.md) groups release work; its archived original schedule is retained for history only.

Status legend:

- `NOT STARTED` — no implementation work has begun
- `PLANNED` — requirements are understood but not yet implemented
- `IN PROGRESS` — actively being built
- `BLOCKED` — waiting on a decision or dependency
- `DONE` — completed and verified
- `DEFERRED` — intentionally postponed

---

## Current priorities and learning preferences

**User direction, updated 23 October 2026:** This is a portfolio project for comprehensive backend learning. Application-owned session auth, PostgreSQL with TypeORM/Data Mapper and the first register/login/caller/logout slice are confirmed. Stack Auth comes from the frontend template and is intended for later removal; removal has not happened. Compare effective cost/capabilities across suitable providers; Cloudflare is a candidate rather than a restriction. Package compatibility, detailed session contract and hosting remain open. Preserve the existing frontend/license and PostgreSQL volume during planning.

The user selected **identity design and database choice first**, then confirmed sessions/PostgreSQL/ORM use. The [temporary auth development plan](../SESSION_AUTH_DEVELOPMENT_PLAN.md) owns the active slice checklist and current Step 1 worksheet; durable choices and tradeoffs live in [backend requirements](../requirements/BACKEND_REQUIREMENTS.md#current-identity-and-database-options). Use the table below when asked what to do next; compare actual completion evidence with these preferences instead of repeating the minimum setup or recommending provider integration by default.

**Accepted stack, 23 October 2026:** [ADR 0001](../architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) selects TypeORM repositories/Data Mapper and reviewed migrations, PostgreSQL-backed application sessions, Argon2id and the supporting Nest stack. ORM selection is settled; package/runtime validation and implementation remain unfinished. The earlier Prisma installation outline is superseded.

| Order | Task and state | Concrete scope / next checkpoint |
| --- | --- | --- |
| 1 | Session-auth contract — current Step 1; implementation not started | Complete the temporary plan's account rules, credential/cookie/CSRF contract, expiry/renewal/revocation, minimal data sketch and HTTP acceptance matrix. Session auth is confirmed; detailed values still need review. |
| 2 | TypeORM foundation — next implementation checkpoint | Add compatible TypeORM/adapter/driver versions, database configuration/module, standalone migration DataSource, initial entities and reviewed migration. Verify constraints, rollback, shutdown and ESM build/test/CLI behavior on isolated PostgreSQL. Hosting remains separate. |
| 3 | API foundation and backend CI — queued; can proceed independently where contracts allow | Complete env example and configuration/health coverage, integer port validation, explicit listener/CORS policy, request validation, response/error conventions, OpenAPI and redacted logging. Add backend-triggered locked install/type/lint/format/unit/e2e/hook/build CI checks and standardize runtime versions. A hosted result must be observed after the developer publishes it. |
| 4 | Persistence and first local-auth slice — queued after 1-2 | Add the chosen provider, migration checks on an isolated database, readiness, then registration/login, session verification and `GET /auth/me` (proposed). Test rollback, concurrent duplicate registration, expired/revoked sessions and cleanup. Add verification/reset/change/logout-all flows to complete SRS account lifecycle. |
| 5 | Organization management and tenant isolation — queued after authenticated persistence | Create organization plus initial owner membership/permissions atomically; list/read/rename authorized organizations; integrate frontend switching after template-auth replacement. Test two tenants, different memberships, forged tenant IDs, permission denial and baseline audit evidence. |
| 6 | Invitations and full membership/RBAC management — queued after 5 | Invitation delivery/expiry/revocation/single-use acceptance; member removal/role assignment; prevent cross-tenant assignments and loss of the last owner. Verify permission and session/membership-revocation policy. |
| Later | Remaining MVP sequence — retained | Plans/subscriptions and test-mode billing; customers/contacts; projects/tasks; attachments; in-app notifications; audit viewer and reporting. Add required audit, validation and authorization safeguards with each earlier feature; later milestones expand their coverage. |

Do not introduce queues, distributed cache, live push, multiple API instances or a managed load balancer merely to use available products. Evaluate them when a feature or operational exercise needs them. R2 is a later file-storage candidate. Hosted API compute, frontend auth replacement/deployment and transactional email delivery remain explicit follow-ups, not verified free-tier capabilities.

**Next review checkpoint:** Resolve the remaining Step 1 contract details, then review the TypeORM database configuration/DataSource, three initial entities and migration before adding auth handlers. Stack acceptance is not code authorization to the assistant; the developer implements and runs generators/migrations. Record actual checks and unresolved feasibility questions in [Validation and Follow-ups](VALIDATION.md).

---

## Milestone 0 — Scope and Domain Lock

**Status:** PLANNED

### Goal
Define the product boundaries before writing the first table or endpoint.

### Deliverables

- final project name
- confirmed MVP scope
- confirmed non-goals
- chosen tenant isolation strategy
- chosen auth strategy
- chosen backend stack
- chosen billing strategy
- initial repository structure

### Decisions to record

- shared database + tenant_id strategy
- UUID primary keys
- soft delete policy
- monolith first
- free-tier-conscious deployment strategy
- Stripe test-mode billing strategy

NestJS is the selected backend direction. Application-owned session auth, PostgreSQL, TypeORM repositories/Data Mapper and reviewed migrations are confirmed; detailed credential/session design, released-version compatibility and hosting remain open. Stack Auth is still present only as the inherited frontend integration pending replacement. See the current priorities above.

---

## Milestone 1 — Solution Skeleton

**Status:** IN PROGRESS

### Goal
Create the basic runnable application structure.

### Deliverables

- frontend app scaffold
- backend API scaffold
- shared configuration system
- Docker Compose for local services
- base CI workflow
- OpenAPI enabled
- health check endpoints

The frontend and CI definitions remain partial foundation work. The developer has added the Nest backend, environment validation and `/health-check`; startup and HTTP smoke passed, with open review findings. Migrations, API documentation, backend CI/container wiring and verified frontend-to-API access remain unfinished.

### Exit criteria

- application boots locally
- frontend can call the API
- database connection works
- basic logging works

---

## Milestone 2 — Identity and Authentication

**Status:** NOT STARTED

### Goal
Implement secure account and session management.

### Deliverables

- user registration
- email verification
- login
- logout
- session renewal (refresh-token flow if that design is selected)
- password reset flow
- password change flow
- session revocation
- auth middleware and policies

### Notes

- implement application-owned identity and account lifecycle, per the user's 22 October 2026 direction; template Stack Auth removal/replacement is separate frontend work
- session-based authentication is selected; finalize opaque credential, cookie/CSRF, expiry/renewal and revocation details before implementation
- access JWT/refresh-token architecture is not the initial design; preserve SRS session renewal/revocation outcomes in the selected session contract

### Exit criteria

- user can register and sign in
- protected endpoints reject unauthenticated callers
- session renewal works safely under the selected session/token contract

---

## Milestone 3 — Tenant and Membership Model

**Status:** NOT STARTED

### Goal
Establish the multi-tenant core.

### Deliverables

- organizations table
- memberships table
- invite flow
- switch active organization flow
- tenant scoping in queries
- tenant validation in authorization

### Exit criteria

- a user can belong to multiple organizations
- every tenant-scoped query is filtered correctly
- invitation acceptance creates membership

---

## Milestone 4 — Authorization and RBAC

**Status:** NOT STARTED

### Goal
Control what members can see and do.

### Deliverables

- role model
- permission model
- role-permission mapping
- policy-based authorization
- admin-only endpoints
- member self-service endpoints

### Exit criteria

- permission checks work at API level
- user interface can consume permission state
- tenant admins cannot affect other tenants

---

## Milestone 5 — Subscription and Billing

**Status:** NOT STARTED

### Goal
Model subscription-based monetization and enforce plan limits.

### Deliverables

- plans table
- subscriptions table
- subscription events table
- billing history
- webhook event storage
- usage tracking
- feature gates
- plan limits

### Notes

- Stripe is the preferred provider
- use test mode first
- do not collect raw card data directly
- keep billing state auditable and append-only where appropriate

### Exit criteria

- a tenant can have an active plan
- limits can be checked by application logic
- billing events are traceable
- webhook processing is idempotent

---

## Milestone 6 — Customer and Contact Management

**Status:** NOT STARTED

### Goal
Add the first real business module.

### Deliverables

- customer CRUD
- customer search and filtering
- customer tags
- contact records
- notes and timeline events
- soft delete support

### Exit criteria

- customers are always scoped to the active tenant
- search and list endpoints support pagination
- audit trail exists for meaningful changes

---

## Milestone 7 — Project and Task Management

**Status:** NOT STARTED

### Goal
Create the core work-management experience.

### Deliverables

- project CRUD
- project membership
- task CRUD
- task assignments
- comments
- labels or tags
- due dates and status transitions
- activity log entries for state changes

### Exit criteria

- project owners can manage work items
- assignees receive visible updates
- task history is preserved

---

## Milestone 8 — Files and Attachments

**Status:** NOT STARTED

### Goal
Support lightweight document handling.

### Deliverables

- file metadata table
- upload endpoint
- download endpoint
- attachment linking to work items
- size and type validation
- local storage adapter for development

### Exit criteria

- files can be attached to records
- metadata remains in the database
- storage can be swapped later without schema redesign

---

## Milestone 9 — Notifications and Real-Time Updates

**Status:** NOT STARTED

### Goal
Improve usability without adding complexity too early.

### Deliverables

- in-app notification table
- read/unread state
- notification preferences
- background notification generation
- future extension point for optional live push; MVP notification correctness does not depend on implementing a live transport

### Exit criteria

- users can see new notifications
- notification records are tenant scoped
- live updates are optional, not required for correctness

---

## Milestone 10 — Audit Logs and Traceability

**Status:** NOT STARTED

### Goal
Make the system explainable and reviewable.

### Deliverables

- append-only audit log table
- actor, action, entity, timestamp, and metadata fields
- action coverage for security-sensitive flows
- admin audit viewer

### Exit criteria

- important changes are traceable
- audit records cannot be edited through normal app flows

---

## Milestone 11 — Reporting and Dashboarding

**Status:** NOT STARTED

### Goal
Expose business value to users.

### Deliverables

- active member metrics
- project throughput metrics
- task status breakdowns
- recent activity dashboard
- simple tenant-level summary cards
- subscription status and usage summary

### Exit criteria

- dashboard reads efficiently
- aggregate queries remain tenant aware
- expensive reads are cached where appropriate

---

## Milestone 12 — Production Hardening

**Status:** NOT STARTED

### Goal
Make the app behave like a real service.

### Deliverables

- structured logging
- rate limiting
- input validation
- health checks
- background jobs
- retryable outbound HTTP clients
- cache strategy
- error handling boundaries
- security review checklist
- webhook idempotency

### Exit criteria

- app can survive common failures gracefully
- observability exists for debugging
- sensitive endpoints are protected against abuse

---

## Milestone 13 — Deployment

**Status:** NOT STARTED

### Goal
Run the application in a practical production-like environment.

### Deliverables

- frontend deployment
- backend deployment
- managed PostgreSQL deployment
- environment variable management
- release notes for each deployment
- smoke test checklist

### Exit criteria

- application is publicly reachable
- core flows work after deployment
- monthly infra cost stays within the planned budget

---

## Milestone 14 — Documentation and Portfolio Finish

**Status:** NOT STARTED

### Goal
Make the repository understandable without extra explanation.

### Deliverables

- updated README
- architecture diagrams
- decision records
- API examples
- onboarding guide
- screenshots or short demo notes

### Exit criteria

- a reviewer can understand the system within minutes
- a new contributor can start from the docs alone

---

## Working Rule for Each Task

Before marking any task complete, verify:

- the change respects tenant isolation
- the change respects authorization rules
- the database schema still matches the domain rule
- the feature is covered by a test or explicit manual check
- the roadmap reflects the new state

---

## Backlog Ideas for Later

These are intentionally deferred until the MVP is stable:

- external OAuth login
- MFA
- advanced search with full-text indexing
- granular field-level permissions
- workflow automation rules
- data export and import tooling
- multi-language support
- mobile application
- public API platform
- real billing automation beyond the core subscription model

Detailed enhancements, including additional SSO/OAuth providers, feature flags/rollout controls, customer segmentation, notification delivery channels and advanced analytics, are retained in the [future roadmap](releases/1.0.0/FUTURE-ROADMAP.md). They do not defer the base behaviors in the canonical SRS scope table.

---

## Definition of Done for the Project

TenantFlow is complete enough for a strong portfolio entry when:

- the core multi-tenant model is correct
- authentication and authorization are secure
- the main business module is functional
- subscription concepts are modeled properly
- audit logs exist for sensitive operations
- the app is deployed in a cost-conscious environment
- the documentation explains architecture and decisions clearly
- the repository can be used as a reference for future work

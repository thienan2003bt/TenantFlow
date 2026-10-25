# ROADMAP

This roadmap tracks the implementation of TenantFlow from architecture decisions to public deployment. The file is meant to stay current and should be updated whenever a milestone changes status.

The developer implements NestJS in `backend/`, beside the independent `frontend/`. The [backend README](../../backend/README.md) owns commands and current runtime behavior; the [validation register](VALIDATION.md) owns recorded results and outstanding checks. Database wiring exists, while domain persistence, authentication and real local PostgreSQL verification remain unfinished.

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

This portfolio project prioritizes comprehensive backend learning through application-owned auth and ORM experience. [ADR 0001](../architecture/decisions/0001-BACKEND-STACK-AND-SESSION-AUTH.md) selects TypeORM repositories/Data Mapper, reviewed migrations, PostgreSQL-backed opaque sessions, Argon2id and the supporting Nest stack. Hosting remains open; compare suitable providers by cost, capability and maintenance. Preserve the frontend/license and PostgreSQL volume.

The [accepted contract](../requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract) owns the account/password/session/browser/API policies, including password length 6-128. The [temporary development plan](../SESSION_AUTH_DEVELOPMENT_PLAN.md#remaining-step-1-close-out-decisions) owns remaining Step 1 proposals. **Finish Step 1 before proceeding to Step 2**, as requested by the developer. Stack Auth replacement remains later frontend work.

| Order | Task and state | Concrete scope / next checkpoint |
| --- | --- | --- |
| 1 | Session-auth contract — baseline accepted; Step 1 close-out pending | Settle the worksheet's remaining identity/Unicode, blocklist/input, CSRF, persistence, renewal/retention and response/abuse-control defaults. Auth implementation has not started. |
| 2 | TypeORM foundation — in progress | Runtime configuration/module and standalone migration DataSource are wired; local static, unit, HTTP smoke and compiled CLI-loading checks passed. Real PostgreSQL startup, initial entities and a reviewed migration remain the next checkpoint. Verify constraints, rollback and shutdown on isolated PostgreSQL. Hosting remains separate. |
| 3 | API foundation and backend CI — queued; can proceed independently where contracts allow | Existing env validation, integer port checks and configuration tests are in place. Add health HTTP coverage, explicit listener/CORS policy, request validation, response/error conventions, OpenAPI and redacted logging. Add backend-triggered locked install/type/lint/format/unit/e2e/hook/build CI checks and standardize runtime versions. Observe hosted results after publication. |
| 4 | Persistence and first local-auth slice — queued after 1-2 | Implement the initial entities and reviewed migration, isolated-database checks and readiness, then registration/login, session verification, `GET /auth/me` and logout. Test rollback, concurrent duplicate registration, expiry/revocation and cleanup. Add verification/reset/change/logout-all flows to complete SRS account lifecycle. |
| 5 | Organization management and tenant isolation — queued after authenticated persistence | Create organization plus initial owner membership/permissions atomically; list/read/rename authorized organizations; integrate frontend switching after template-auth replacement. Test two tenants, different memberships, forged tenant IDs, permission denial and baseline audit evidence. |
| 6 | Invitations and full membership/RBAC management — queued after 5 | Invitation delivery/expiry/revocation/single-use acceptance; member removal/role assignment; prevent cross-tenant assignments and loss of the last owner. Verify permission and session/membership-revocation policy. |
| Later | Remaining MVP sequence — retained | Plans/subscriptions and test-mode billing; customers/contacts; projects/tasks; attachments; in-app notifications; audit viewer and reporting. Add required audit, validation and authorization safeguards with each earlier feature; later milestones expand their coverage. |

Do not introduce queues, distributed cache, live push, multiple API instances or a managed load balancer merely to use available products. Evaluate them when a feature or operational exercise needs them. R2 is a later file-storage candidate. Hosted API compute, frontend auth replacement/deployment and transactional email delivery remain explicit follow-ups, not verified free-tier capabilities.

**Next review checkpoint:** Close the remaining Step 1 details. Step 2 follows later: verify the wired database configuration/DataSource against local PostgreSQL, then review the three initial entities and migration before auth handlers. Record actual checks in [Validation and Follow-ups](VALIDATION.md); the developer implements and runs generators/migrations.

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

The backend stack, application-owned opaque sessions and PostgreSQL/TypeORM migration approach are selected. Remaining auth details, real database behavior and hosting are tracked in the current priorities above. Stack Auth remains in the frontend pending replacement.

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

The Nest backend includes environment validation, configuration tests, `/health-check` and TypeORM runtime/CLI wiring. Startup and HTTP smoke have recorded evidence, with the database stubbed in the HTTP suite. Real PostgreSQL verification, migrations, API documentation, backend CI/container wiring and verified frontend-to-API access remain unfinished.

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
- opaque-session renewal within the absolute expiry limit
- password reset flow
- password change flow
- session revocation
- auth middleware and policies

### Notes

- implement application-owned identity under the accepted contract; template Stack Auth replacement is separate frontend work
- settle the remaining Step 1 details before implementing the first slice
- preserve SRS verification, recovery/password change, renewal and revocation outcomes beyond the initial slice

### Exit criteria

- user can register and sign in
- protected endpoints reject unauthenticated callers
- session renewal works safely within the selected opaque-session contract

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

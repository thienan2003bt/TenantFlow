# ROADMAP

This roadmap tracks the implementation of TenantFlow from architecture decisions to public deployment. The file is meant to stay current and should be updated whenever a milestone changes status.

Status legend:

- `NOT STARTED` — no implementation work has begun
- `PLANNED` — requirements are understood but not yet implemented
- `IN PROGRESS` — actively being built
- `BLOCKED` — waiting on a decision or dependency
- `DONE` — completed and verified
- `DEFERRED` — intentionally postponed

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

---

## Milestone 1 — Solution Skeleton

**Status:** NOT STARTED

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
- refresh token flow
- password reset flow
- password change flow
- session revocation
- auth middleware and policies

### Notes

- use ASP.NET Core Identity for identity storage and password hashing
- use JWT access tokens for API authentication
- rotate refresh tokens rather than reusing them

### Exit criteria

- user can register and sign in
- protected endpoints reject unauthenticated callers
- token refresh works safely

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
- optional SignalR live push channel

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

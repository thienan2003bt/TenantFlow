# TenantFlow

TenantFlow is a planned multi-tenant B2B SaaS workspace. The repository contains product requirements, provisional TypeScript domain models, a Next.js frontend starter using Stack Auth, optional PostgreSQL development storage, and a developer-created NestJS scaffold in `backend/`. Backend business features remain to be implemented; scaffold presence does not establish verified API behavior.

Start with the [documentation index](docs/README.md) for requirements, architecture, setup and planning. The [NestJS setup guide](docs/setup/NESTJS_BACKEND_SETUP.md) walks through building a minimal application inside `backend/`, ending with `GET /health-check` returning HTTP 200. You write the backend; the assistant supplies instructions, reviews and feedback.

The project is intentionally designed to exercise the same concerns that appear in real business software:

- tenant isolation
- authentication and authorization
- role-based access control
- subscription billing
- auditability
- background processing
- reusable API integration patterns
- observability
- deployment discipline
- maintainable database design

This repository is not a toy demo. The goal is to model a realistic SaaS product that could be shipped as a subscription-based business, while still remaining practical to build as a solo portfolio project.

---

## 1. Product Summary

TenantFlow is a B2B workspace platform for internal business operations. It is intended to model a realistic enterprise SaaS, not a simple CRUD demo.

The planned application supports multiple organizations sharing the same platform while keeping data isolated per tenant. Each organization can manage members, permissions, customers, projects, tasks, notifications, files, audit logs, and subscriptions.

This project is suitable for demonstrating:

- full-stack application design
- clean backend architecture
- database schema planning
- security-sensitive flows
- production-ready API development
- billing and subscription design
- deployment and maintenance discipline

---

## 2. Product Goals

1. Demonstrate a credible enterprise-grade B2B architecture.
2. Keep the first production version small enough to finish.
3. Support subscription-based monetization in the domain model.
4. Build a modular backend whose technology choices follow the requirements and are documented when implemented.
5. Produce a codebase that Copilot can help extend safely because the domain rules, roadmap, and architecture decisions are explicit.

---

## 3. Non-Goals for MVP

The initial release must not include:

- microservices
- multi-region deployment
- custom workflow engines
- machine learning features
- mobile apps
- game-related features
- over-engineered infrastructure

The billing system should support subscription concepts, but the implementation can begin in test mode or sandbox mode before any real commercial launch.

---

## 4. Technology Direction and Current State

### 4.1 Frontend

The existing starter uses Next.js 15.1.11, React 19, TypeScript, Tailwind CSS, shadcn-style UI components, and Stack Auth. It provides sign-in/account/team flows and template dashboards; the displayed business metrics and placeholder pages are not implemented product modules.

Earlier candidates for additional frontend tooling include TanStack Query, Zustand, React Hook Form, and Zod. These are not installed or approved by the backend restart.

### 4.2 Backend and Data Access

The backend now has a NestJS 12 scaffold with ESM, Vitest and the local Nest CLI. Validated startup and `/health-check` behavior are the first implementation target and have not been runtime-verified in this documentation review. Persistence, migrations, identity/tenant features and backend Docker/CI remain subsequent work. PostgreSQL remains the planned database. The root model files are design references, not executable migrations.

Review the [backend requirements and design notes](docs/requirements/BACKEND_REQUIREMENTS.md), [engineering conventions](docs/architecture/BACKEND_CONVENTIONS.md), and [setup guide](docs/setup/NESTJS_BACKEND_SETUP.md) before implementation. The guide covers the minimum Nest application, feature-module folders and validated startup configuration. Database access, identity verification and integrations are subsequent work.

### 4.3 Authentication and Authorization

Preserve secure registration, email verification, sign-in/out, password reset/change, session renewal/revocation, refresh-token rotation where applicable, and future MFA. The frontend currently delegates identity/team flows to Stack Auth. Decide API credential verification, domain identity ownership, and provider-user/team mapping before building the backend.

Enforce tenant boundaries, coarse-grained roles, and fine-grained permission policies at the API layer. Client team selection and hidden UI controls cannot enforce authorization. Do not introduce a parallel password/session store without an explicit decision.

### 4.4 Integration and Operational Requirements

- Use typed integration boundaries, timeouts, and appropriate retries/circuit breaking for outbound HTTP calls.
- Validate requests and domain invariants; return explicit response contracts without sensitive data.
- Plan structured logs, readiness/liveness checks, diagnosable errors, and optional later OpenTelemetry traces/metrics.
- Keep caching simple initially; consider Redis/distributed caching only when justified, with tenant-aware keys and invalidation.
- Start background processing with the simplest sufficient model; add durable scheduling only when required.
- Treat live notification delivery as optional; notification correctness must not depend on a push transport.
- Use a storage boundary, local development storage where useful, and PostgreSQL file metadata rather than raw binaries.
- Document implemented APIs with OpenAPI and an exploration interface.
- Add meaningful domain/API/database tests, especially isolation, authorization, sessions and webhook idempotency. Container-based integration tests can be considered later.

No backend libraries or services for these capabilities are installed. Setup recommendations become project decisions when recorded and implemented by the developer.

### 4.5 Payment Module

Preserve the subscription-based billing model and planned Stripe test-mode integration. Store only necessary payment metadata and never handle raw card data. Provider client selection belongs to backend implementation; the [SRS](docs/requirements/TenantFlow-SRS.md) retains billing and webhook requirements.

---

## 5. Recommended Domain Scope

### Tenant structure

The platform follows a shared-database, tenant-id isolation model.

Every tenant-scoped table must contain:

- tenant_id
- created_at
- updated_at
- created_by
- updated_by
- deleted_at when soft delete is required

### Core modules

1. Identity and account management
2. Organization and tenant management
3. Memberships and invitations
4. Roles and permissions
5. Subscription and billing
6. Customers and contacts
7. Projects and work items
8. Tasks and comments
9. Notifications
10. Audit logs
11. File attachments
12. Reporting and dashboards

---

## 6. Business Rules

### Tenant isolation

- A user may belong to multiple organizations.
- All application data must be scoped to a tenant.
- Cross-tenant reads and writes are forbidden by default.
- Query filters and authorization checks must both enforce tenant boundaries.

### Membership rules

- A user joins an organization through a membership record.
- A membership can have exactly one primary role or a role set, depending on the schema decision.
- Invited users are not active members until they accept the invitation.

### Billing rules

- Each tenant can have one active subscription at a time, unless future product decisions require multiple subscriptions.
- Subscription status determines which features and limits are available.
- Free, starter, business, and enterprise plans can be modeled in the database even before all plans are enabled.
- Billing events should be stored as history, not overwritten.

### Ownership rules

- Every business object must have a clearly defined owner, assignee, or tenant relationship.
- Historical records should remain readable after the original owner is deleted or deactivated.

### Audit rules

- Security-sensitive and state-changing actions should create audit entries.
- Audit records are append-only.
- Audit data should preserve who changed what, when, and from where.

---

## 7. Suggested User Roles

- Platform Admin
- Organization Owner
- Billing Admin
- Manager
- Member
- Read-only Viewer
- Support Agent, if the support module is included

Roles must be implemented through authorization policies, not by relying only on UI hiding.

---

## 8. Functional Requirements

### 8.1 Authentication

- register
- verify email
- log in
- log out
- refresh session
- reset password
- change password
- revoke active sessions
- optional MFA placeholder for future expansion

### 8.2 Organization Management

- create organization
- rename organization
- archive organization
- invite members
- remove members
- switch active organization

### 8.3 Authorization

- enforce role-based access
- enforce permission-based access for sensitive actions
- restrict tenant-wide admin actions
- log authorization failures where useful

### 8.4 Subscription and Billing

- create subscription
- change subscription plan
- cancel subscription
- resume subscription
- track billing status
- record webhook events
- store billing history
- apply plan limits and feature gates

### 8.5 Customer Management

- create customer records
- edit customer data
- tag customers
- search and filter customers
- store contact persons
- store notes and interaction history

### 8.6 Project and Work Management

- create projects
- assign owners and members
- move projects between states
- create tasks
- assign tasks
- comment on tasks
- attach files
- track status changes

### 8.7 Notifications

- in-app notifications for assignments, mentions, and state changes
- mark notifications as read
- user-level notification preferences

### 8.8 Auditability

- record major create/update/delete events
- preserve actor, entity, action, and timestamps
- allow admins to inspect recent activity

### 8.9 Reporting

- list active users
- count open tasks
- track project throughput
- summarize recent activity
- summarize subscription status and usage

---

## 9. Repository Structure

```text
.
|-- README.md
|-- docs/
|   |-- README.md    # Documentation index and document ownership
|   |-- requirements/ # SRS and backend requirements
|   |-- architecture/ # Backend engineering conventions
|   |-- setup/       # Current onboarding and future NestJS setup guide
|   +-- planning/    # Roadmap, validation, release plans and future scope
|-- assets/images/  # Shared documentation images
|-- backend/        # Developer-created NestJS scaffold
|-- frontend/       # Existing Next.js / Stack Auth starter
|-- schemas.ts      # Provisional model reference
|-- enum.ts         # Domain lifecycle vocabulary
+-- docker-compose.yml
```

The NestJS scaffold lives in `backend/`, with its own `package.json`, `src/`, `test/` and related configuration. Use the local Nest CLI generators for colocated feature modules, controllers and services. Follow the setup guide to implement and verify the first `/health-check` endpoint; keep the existing frontend and root infrastructure configuration independent.

---

## 10. Data Modeling Principles

The database design must obey the following rules:

- model from business boundaries first, not from tables first
- use UUID primary keys
- prefer explicit join tables for many-to-many relationships
- keep tenant_id on every tenant-scoped table
- use soft delete for records that must remain visible in history
- index every common tenant-scoped lookup
- preserve historical references even if the original actor or owner is removed
- avoid storing derived values unless there is a measurable reason

Recommended fields for most tables:

- id
- tenant_id where applicable
- created_at
- updated_at
- created_by
- updated_by
- deleted_at where applicable

---

## 11. Development Workflow

The project should be run like a small professional product, not like a folder of experiments.

### Planning flow

1. Read the [implementation roadmap](docs/planning/ROADMAP.md).
2. Pick one milestone.
3. Create a small set of issues for that milestone.
4. Implement one task at a time.
5. Validate with tests.
6. Update the roadmap status.
7. Document notable architectural decisions.

### Branching flow

- `main` for stable code
- `dev` for integration
- `feature/*` for features
- `fix/*` for bug fixes
- `docs/*` for documentation changes

### Commit style

Use conventional commit style:

- `feat:`
- `fix:`
- `refactor:`
- `test:`
- `docs:`
- `chore:`

---

## 12. Local Development

Follow [START_HERE](docs/setup/START_HERE.md) for the existing frontend and optional PostgreSQL container. The [environment guide](docs/setup/ENV_AND_GITIGNORE_SETUP.md) explains actual files and consumers. No backend startup or migration command exists yet.

Node.js 22/npm are the existing frontend tooling baseline. Docker with Compose is needed for PostgreSQL/container work. Keep local secrets out of Git and separate credentials between environments. Backend database, identity, email, storage and billing configuration will be defined alongside actual implementations.

Frontend build-time configuration uses public build arguments and a private BuildKit secret. Recorded frontend/database/image checks and the outstanding real-authentication follow-up are maintained in [Validation and Follow-ups](docs/planning/VALIDATION.md). Historical results do not certify a new environment or completed product behavior.

---

## 13. Deployment Strategy

The target is a practical, cost-conscious SaaS deployment.

Recommended rules:

- deploy frontend on a low-cost or free static/web tier where possible
- deploy the API on a small Linux app service or container host
- use managed PostgreSQL
- keep the app small enough that it can be demonstrated without enterprise-grade infrastructure
- avoid paid queues, paid workers, and paid object storage unless justified by the current milestone

The operational rule is simple: if a feature cannot be supported by the current budget, it should not be introduced until the architecture and roadmap justify it.

---

## 14. Quality Bar

A feature is considered complete only when it has:

- a clear user story
- validation rules
- authorization rules
- tenant scoping
- database changes
- tests where practical
- logging or audit coverage if it is sensitive
- documentation updates if it changes the workflow

---

## 15. What Good Looks Like

The project should eventually make it easy for a reviewer to answer these questions:

- What is the tenant model?
- How is access controlled?
- How are entities related?
- How is the data protected from leakage between tenants?
- How are subscriptions and billing modeled?
- How are background tasks handled?
- How are errors and activity recorded?
- How is the app deployed?
- Why were these architecture decisions chosen?

---

## 16. Link to Progress Tracking

Track implementation status in the [implementation roadmap](docs/planning/ROADMAP.md) and remaining validation in [Validation and Follow-ups](docs/planning/VALIDATION.md). Release grouping and historical schedules live under [release planning](docs/planning/releases/1.0.0/VERSION-PLANNING.md).

The implementation roadmap is the source of truth for:

- milestone order
- feature completion status
- postponed items
- architecture decisions that affect sequencing

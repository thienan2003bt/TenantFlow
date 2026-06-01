# TenantFlow

TenantFlow is a multi-tenant B2B SaaS reference project built to demonstrate enterprise web engineering skills with ASP.NET Core 8, PostgreSQL, and a modern React frontend.

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

The application supports multiple organizations sharing the same platform while keeping data isolated per tenant. Each organization can manage members, permissions, customers, projects, tasks, notifications, files, audit logs, and subscriptions.

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
4. Use common .NET ecosystem choices so the codebase remains recognizable to employers.
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

## 4. Recommended Technology Stack

### 4.1 Frontend

- React
- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query for server state
- Zustand for local client state
- React Hook Form for forms
- Zod for schema validation on the client
- shadcn/ui for a practical component layer

### 4.2 Backend

- .NET 8 LTS
- ASP.NET Core 8 Web API
- Minimal APIs for small endpoints where they improve clarity
- Controllers where grouping, filters, or heavier composition are beneficial
- C#

### 4.3 Data Access

- Entity Framework Core 8
- PostgreSQL
- EF Core migrations
- repository pattern only where it adds value; do not wrap EF Core blindly

### 4.4 Authentication and Authorization

Use the built-in ASP.NET Core authentication and authorization stack as the foundation.

Recommended modules:

- ASP.NET Core Identity for user accounts, password hashing, email verification, and password reset flows
- JWT bearer authentication for the API surface
- refresh token rotation for session continuity
- policy-based authorization for permissions
- role-based access control for coarse-grained access
- claims-based authorization for fine-grained checks

Use external identity providers only if a later milestone requires them.

### 4.5 HTTP and Outbound Integrations

- IHttpClientFactory for all outbound HTTP calls
- typed clients for each external integration
- Microsoft.Extensions.Http.Resilience for retries, timeout, circuit breaker, and other resilience policies

### 4.6 Validation

- FluentValidation for request and command validation
- DataAnnotations only where they are simple and local

### 4.7 Logging and Observability

- built-in ILogger abstraction
- Serilog for structured logging
- OpenTelemetry for traces and metrics if the project reaches that stage
- health checks for readiness and liveness endpoints

### 4.8 Caching

- in-memory cache only for local development and trivial lookup data
- distributed cache abstraction for production-ready caching behavior
- Redis if a free-tier provider is available

### 4.9 Background Jobs

- IHostedService / BackgroundService for lightweight local jobs
- Hangfire only if the project reaches the point where durable scheduled jobs are justified

### 4.10 Real-Time Features

- SignalR for notifications and live UI updates if needed

### 4.11 File Storage

- local filesystem for development
- abstract storage service interface for future compatibility with object storage
- store file metadata in PostgreSQL, not raw binaries

### 4.12 API Documentation

- built-in OpenAPI support
- Swagger UI for exploration and manual testing

### 4.13 Testing

- xUnit
- FluentAssertions
- integration tests for API and database boundaries
- Testcontainers if local container-based integration tests are practical

### 4.14 Payment Module

The product includes a subscription-based billing model.

Stripe is the recommended payment provider because it provides official .NET support and a strong test-mode workflow. In production, the project should store only the minimum payment-related information necessary and should never handle raw card data directly.

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
├── README.md
├── ROADMAP.md
├── docs/
│   ├── architecture/
│   ├── decisions/
│   └── domain/
├── src/
│   ├── Api/
│   ├── Application/
│   ├── Domain/
│   ├── Infrastructure/
│   └── Web/
├── tests/
│   ├── Api.Tests/
│   ├── Application.Tests/
│   └── IntegrationTests/
└── deploy/
    ├── docker/
    └── infra/
```

### Layer meaning

- `Domain`: entities, value objects, domain rules, invariants
- `Application`: use cases, commands, queries, DTOs, interfaces
- `Infrastructure`: EF Core, external services, email, storage, cache, auth adapters
- `Api`: endpoint composition, middleware, filters, request/response contracts
- `Web`: frontend application

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

1. Read `ROADMAP.md`.
2. Pick one milestone.
3. Create a small set of issues for that milestone.
4. Implement one task at a time.
5. Validate with tests.
6. Update the roadmap status.
7. Document notable architectural decisions.

### Branching flow

- `main` for stable code
- `develop` for integration if needed
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

### Prerequisites

- .NET SDK 8
- Node.js
- PostgreSQL
- Docker Desktop or Docker Engine
- Git

### Local services

Use Docker Compose for:

- PostgreSQL
- optional Redis
- optional mail testing service

### Local configuration

Keep all secrets out of source control.

Use environment variables or local user secrets for:

- database connection string
- JWT signing key
- refresh token signing secret if separated
- email provider configuration
- storage configuration
- external API keys
- payment provider configuration

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

Track implementation status in `ROADMAP.md`.

That file is the source of truth for:

- milestone order
- feature completion status
- postponed items
- architecture decisions that affect sequencing

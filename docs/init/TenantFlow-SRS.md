# TenantFlow Software Requirements Specification (SRS)

**Version:** 1.0  
**Target release:** 1.0.0 MVP + forward-looking full product requirements  
**Purpose:** Define the functional and non-functional requirements of TenantFlow so the database schema, ERD, application architecture, and implementation plan can be designed consistently.

---

## 1. Introduction

### 1.1 Product Overview

TenantFlow is a multi-tenant B2B SaaS platform for managing organizations, memberships, roles, subscriptions, business customers, projects, tasks, notifications, files, and audit logs.

The system is intended to model a realistic enterprise application. The initial release is an MVP, but the requirements document covers the full application so the database design remains extensible.

### 1.2 Product Goals

TenantFlow should:

- support multiple tenant organizations in one shared platform
- isolate tenant data securely
- support subscription-based monetization
- provide role-based access control
- preserve audit history for important actions
- support operational workflows used in real B2B products
- remain practical for solo development and portfolio use

### 1.3 Design Principles

- Model from business rules first, not from tables first.
- Keep tenant boundaries explicit.
- Prefer simple monolithic architecture for the first version.
- Use clear ownership and traceability for every business record.
- Design the schema so that later features can be added without breaking the core model.
- Avoid over-engineering features before the core workflow is stable.

---

## 2. Scope

### 2.1 Inner Scope for the 1.0.0 MVP

The first release should include the following major feature groups:

1. User authentication and account lifecycle
2. Organization and tenant management
3. Invitation and membership management
4. Roles and permissions
5. Subscription and billing model
6. Customer/contact management
7. Project/workspace management
8. Task management
9. File attachments
10. Notifications
11. Audit logs
12. Reporting/dashboard summaries
13. Core admin operations
14. Basic settings and preferences

### 2.2 Out of Scope for MVP

The initial release should not require:

- microservices
- multi-region deployment
- mobile apps
- advanced workflow automation
- AI-assisted features
- public developer platform
- complex enterprise integrations
- custom billing logic beyond standard subscription modeling

### 2.3 Future-Safe Scope

Although the MVP is limited, the domain model should be able to support later features such as:

- advanced analytics
- feature flags
- usage-based billing
- team-level permissions
- multiple subscription plans per organization
- data export/import
- SSO/OAuth login
- MFA
- support tickets
- CRM pipeline stages
- approval workflows

---

## 3. User Classes and Roles

### 3.1 User Classes

#### Platform Administrator

Manages platform-level operational concerns across all tenants.

#### Organization Owner

Creates and manages an organization, billing, membership, and major settings.

#### Billing Admin

Manages subscription status, plan changes, and billing details for an organization.

#### Manager

Manages projects, tasks, members, and customer records.

#### Member

Participates in normal operational work within an organization.

#### Viewer

Read-only access to selected data.

#### Support Agent

Optional future role for support-oriented workflows.

### 3.2 Role Model Requirements

- A user may belong to multiple organizations.
- A user may hold different roles in different organizations.
- Platform-level roles and tenant-level roles must be separable.
- The authorization model must support both coarse-grained roles and fine-grained permissions.

---

## 4. Product Summary of the First Release

### 4.1 Major Features in 1.0.0 MVP

The first release should include the following large feature sets:

#### A. Authentication and Account Management

- registration
- email verification
- login
- logout
- password reset
- password change
- refresh session
- session revocation

#### B. Tenant and Organization Management

- create organization
- rename organization
- archive organization
- switch active organization
- view organization profile
- manage organization settings

#### C. Invitations and Memberships

- invite users by email
- accept or reject invitations
- expire or revoke invitations
- list organization members
- deactivate or remove members

#### D. Role-Based Access Control

- assign roles to members
- define permissions
- restrict actions based on role
- support tenant-safe authorization

#### E. Subscription and Billing

- define subscription plans
- assign plan to an organization
- track active subscription status
- handle payment provider webhooks
- store billing history
- model plan limits and feature access

#### F. Customer Management

- create and manage customer records
- store customer contact people
- track notes and history
- search and filter customers

#### G. Project and Task Management

- create projects
- assign members
- create tasks
- assign tasks
- track task status changes
- add comments
- use labels or tags
- support due dates and priorities

#### H. File Attachments

- upload files
- attach files to entities
- store file metadata
- enforce size and type rules

#### I. Notifications

- create in-app notifications
- mark notifications as read/unread
- notify users for key events

#### J. Audit Logs

- record sensitive actions
- preserve actor, entity, time, and action details
- support admin review

#### K. Dashboard and Reporting

- show summary metrics
- show recent activity
- show task status overview
- show subscription summary
- show membership and usage summary

---

## 5. Functional Requirements

### 5.1 Authentication

#### Description

The system shall support secure user account creation and session management.

#### Requirements

- Users shall be able to register with email and password.
- Users shall verify their email address before full activation.
- Users shall log in and receive an authenticated session.
- Users shall refresh sessions without re-entering credentials.
- Users shall log out from the current session.
- Users shall revoke all active sessions.
- Users shall reset forgotten passwords.
- The system shall hash passwords securely.
- The system shall support future MFA without breaking the identity model.

### 5.2 Organization Management

#### Description

The system shall allow users to create and manage organizations.

#### Requirements

- A user shall be able to create an organization.
- An organization shall have a name, status, and ownership data.
- An organization shall be archivable and restorable if allowed.
- A user shall be able to switch their active organization.
- Organization settings shall be stored separately from membership data.

### 5.3 Invitations and Memberships

#### Description

The system shall allow secure invitation-based membership onboarding.

#### Requirements

- Organization owners or authorized users shall invite members by email.
- Invitations shall expire after a configurable period.
- Invitations shall be revocable.
- Accepting an invitation shall create a membership record.
- Memberships shall link users to organizations.
- A user may have multiple memberships across different organizations.

### 5.4 Roles and Permissions

#### Description

The system shall restrict actions through role and permission rules.

#### Requirements

- Roles shall be assignable to members.
- Permissions shall be definable independently from roles.
- Roles shall map to one or more permissions.
- API endpoints shall enforce permissions, not only UI visibility.
- The system shall support platform-level permissions and tenant-level permissions.

### 5.5 Subscription and Billing

#### Description

The system shall support subscription-based monetization.

#### Requirements

- The system shall define plans such as Free, Starter, Business, and Enterprise.
- The system shall assign one active plan or subscription to an organization.
- The system shall store billing status, renewal dates, and cancellation state.
- The system shall support provider webhooks.
- The system shall store billing events and transaction history.
- The system shall support plan limits and feature access checks.
- The system shall support future usage-based billing if needed.
- The system shall not store raw card data.

### 5.6 Customer Management

#### Description

The system shall allow tenant users to manage customer records.

#### Requirements

- Users shall create and update customer records.
- Users shall store contact details for each customer.
- Users shall add notes, tags, and status information.
- Users shall search and filter customer lists.
- Customer records shall remain tenant-scoped.

### 5.7 Project and Task Management

#### Description

The system shall allow operational work management.

#### Requirements

- Users shall create projects.
- Users shall assign members to projects.
- Users shall create tasks under projects or work scopes.
- Users shall assign tasks to members.
- Users shall update task statuses.
- Users shall comment on tasks.
- Users shall add labels or tags.
- Users shall set due dates and priorities.
- Users shall view task history.

### 5.8 File Attachments

#### Description

The system shall support file uploads and attachments.

#### Requirements

- Users shall upload files.
- Files shall be attachable to tasks, customers, projects, or other supported entities.
- The system shall store file metadata in the database.
- The system shall support storage abstraction.
- The system shall validate file size and type.

### 5.9 Notifications

#### Description

The system shall provide in-app notifications.

#### Requirements

- Users shall receive notifications for mentions, assignments, invitations, and important state changes.
- Users shall mark notifications as read or unread.
- Users shall optionally configure notification preferences.
- Notification records shall be tenant-aware.

### 5.10 Audit Logs

#### Description

The system shall preserve an audit trail of sensitive activity.

#### Requirements

- The system shall record important create, update, delete, and authorization-sensitive actions.
- Audit records shall include actor, action, target entity, timestamp, tenant, and metadata.
- Audit logs shall be append-only.
- Audit logs shall support admin review and troubleshooting.

### 5.11 Dashboard and Reporting

#### Description

The system shall provide summary views for operational insight.

#### Requirements

- The system shall show recent activity.
- The system shall summarize task counts by status.
- The system shall summarize active members and projects.
- The system shall summarize billing status and plan usage.
- The system shall support future aggregation growth.

---

## 6. Non-Functional Requirements

### 6.1 Security

- All tenant-scoped data must be isolated by tenant boundaries.
- Authentication tokens must be protected.
- Sensitive data must be encrypted or handled securely where appropriate.
- Authorization must be enforced at the API layer.
- Audit logging must preserve security-relevant events.

### 6.2 Performance

- Common list endpoints should support pagination and filtering.
- Queries should be indexed around tenant_id and business filters.
- Expensive summaries should be designed for caching or background aggregation later.

### 6.3 Maintainability

- The domain model should be readable and modular.
- Schema naming should be consistent.
- Business rules should be explicit in code and database constraints where practical.

### 6.4 Reliability

- The system should remain usable if a background job fails.
- Webhook handling should be idempotent.
- Important operations should be retry-safe where possible.

### 6.5 Usability

- Users should be able to understand tenant switching clearly.
- Users should be able to see plan status, access limits, and major alerts.
- Administrative workflows should be discoverable.

### 6.6 Observability

- The system should log important events.
- The system should support tracing and health checks later.
- Errors should be diagnosable without exposing sensitive data.

---

## 7. Data Modeling Requirements

### 7.1 Core Design Rules

- Use UUID primary keys.
- Use explicit foreign keys.
- Use junction tables for many-to-many relationships.
- Keep tenant_id on tenant-scoped tables.
- Use soft delete where historical visibility matters.
- Preserve immutable history where appropriate.

### 7.2 Core Entities

The database should be able to model at least the following entity groups:

#### Identity

- users
- sessions
- refresh_tokens
- email_verification_tokens
- password_reset_tokens

#### Tenant and Membership

- organizations
- memberships
- invitations
- organization_settings

#### Authorization

- roles
- permissions
- role_permissions
- membership_roles or equivalent assignment tables

#### Billing

- plans
- subscriptions
- subscription_events
- billing_transactions
- webhook_events
- usage_records

#### Business Data

- customers
- customer_contacts
- projects
- project_members
- tasks
- task_comments
- task_labels
- task_status_history
- notifications
- audit_logs
- files
- attachments

#### Platform Support

- feature_flags
- settings
- activity_feed items or event projections if needed later

### 7.3 Required Fields for Most Tenant-Scoped Tables

- id
- tenant_id
- created_at
- updated_at
- created_by
- updated_by
- deleted_at, if soft delete is used

### 7.4 Historical Data Rules

- Deleted users should not destroy historical audit or billing references.
- Archived organizations should preserve records.
- Payment and subscription history should remain queryable.
- Audit logs should not be edited through normal application flows.

---

## 8. Suggested Domain Relationships

### 8.1 Identity and Tenant

- A user can join many organizations.
- An organization can contain many users.
- Membership acts as the join entity.

### 8.2 Authorization

- A membership can have one or more roles.
- Roles contain permissions.
- Permissions map to allowed actions.

### 8.3 Billing

- An organization has one active subscription at a time.
- A subscription references a plan.
- A plan defines limits and feature access.
- Billing events and webhook events should be stored separately from operational entities.

### 8.4 Business Data

- Customers belong to organizations.
- Projects belong to organizations.
- Tasks belong to projects or a tenant-scoped container.
- Comments belong to tasks or another target entity.
- Attachments can link to many supported entities through a polymorphic or explicit association strategy.
- Notifications target users and belong to a tenant.
- Audit logs belong to a tenant and reference actor and target data.

---

## 9. External Integration Requirements

### 9.1 Email

The system should support email delivery for:

- registration confirmation
- password reset
- invitation delivery
- billing alerts
- notifications if email delivery is enabled later

### 9.2 Payment Provider

The system should support a payment provider through a service boundary.

Required capabilities:

- create or sync subscriptions
- receive webhooks
- handle plan changes
- record transaction history
- recover from duplicate webhook delivery

### 9.3 File Storage

The system should not hardcode file storage implementation.

It should support:

- local filesystem for development
- object storage later if needed

---

## 10. Validation Rules

- Emails must be unique per account identity scope.
- Invitations must be valid only for the target email and tenant.
- Memberships must not duplicate the same user and organization pair.
- Subscription state must be consistent with plan and billing status.
- Task status transitions should respect allowed workflow rules.
- Attachments must obey file size and extension/type validation.
- Tenant-scoped access must be validated at the database query and business logic layers.

---

## 11. Acceptance Criteria for the SRS

This SRS is sufficiently detailed if:

- the ERD can be drawn directly from it
- each entity has a clear ownership boundary
- every relationship has a business reason
- every major feature has a role, actor, and data model implication
- the MVP path is clear, but the full product is still represented
- later expansions can be added without redesigning the core model

---

## 12. Recommended Schema Design Order

When you begin schema design, do it in this order:

1. Identity
2. Organizations and memberships
3. Roles and permissions
4. Plans and subscriptions
5. Customers
6. Projects
7. Tasks
8. Comments and statuses
9. Notifications
10. Audit logs
11. Files and attachments
12. Reporting projections
13. Feature flags and support tables

---

## 13. Notes for Manual ERD Creation

When drawing the ERD, pay attention to:

- cardinality
- nullable vs non-nullable foreign keys
- unique constraints
- composite indexes
- tenant scoping
- history preservation
- deletion behavior
- subscription boundaries
- permission inheritance
- attachment ownership rules

---

## 14. Final Statement

This specification is intentionally broader than the MVP. The first release should implement only the highest-value pieces, but the schema should be designed so the product can grow into a real SaaS platform later without structural rewrites.

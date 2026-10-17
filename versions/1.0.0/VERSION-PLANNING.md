# TenantFlow - Version Planning Roadmap

## Vision

TenantFlow 1.0.0 aims to deliver a production-ready multi-tenant SaaS platform for customer management, project management, task tracking, tenant administration, subscription billing, and collaboration.

**Restart status (2026-10-17):** Backend work is requirements-only for NestJS. Release boundaries follow the [canonical SRS scope](../../docs/init/TenantFlow-SRS.md#24-canonical-release-boundaries). The original dates are preserved once in the [historical schedule](#historical-schedule); no replacement dates are committed. Checkboxes distinguish repository artifacts from verified behavior. Use the [implementation roadmap](../../docs/init/ROADMAP.md) for current sequencing and [backend requirements](../../docs/init/BACKEND_REQUIREMENTS.md) for open technical decisions.

---

# Version 0.0.0 - Foundation

## Goal

Project bootstrap and technical foundation.

## Deliverables

- [x] Repository initialization
- [ ] NestJS backend implementation (requirements and design notes only)
- [x] PostgreSQL Compose configuration, readiness/SQL and cleanup verified in hosted CI
- [x] React/Next.js frontend scaffold present
- [x] Frontend/PostgreSQL container configuration verified by image/start/HTTP and database smoke checks
- [x] Corrected CI passed frontend lint/build/image smoke and Compose/PostgreSQL checks (implementation commit 979d4bd; see the [cleanup tracker](../../BACKEND_CLEANUP_PLAN.md#10-step-7-pr-handoff))
- [ ] Deployment automation
- [x] Initial TypeScript domain model references drafted
- [ ] Domain constraints and model consistency reviewed
- [ ] Initial ERD delivered and verified (no artifact found in the baseline checkout)

## Exit Criteria

- [x] Existing frontend builds (Node.js 22 with fake Stack Auth settings; real authentication unverified)
- [ ] Full application builds after backend implementation
- [ ] Database migrations working
- [x] Local development environment documented (Docker-engine and real-auth verification limits are explicit)

---

# Version 0.1.0 - Authentication

## Goal

Identity and access management.

## Deliverables

- [ ] User registration
- [ ] User login
- [ ] Password hashing
- [ ] Refresh tokens
- [ ] Email verification
- [ ] Password reset
- [ ] Password change
- [ ] Logout and session revocation
- [ ] User profile management

Required verification/reset delivery belongs to this account lifecycle, whether handled by the identity provider or application. Password change, logout and session revocation remain MVP requirements. MFA and additional SSO/OAuth integrations stay in the [future backlog](FUTURE-ROADMAP.md#identity-enhancements), consistent with the SRS; factor types in the model are extension points.

## Exit Criteria

- [ ] Secure authentication flow completed

---

# Version 0.2.0 - Tenant Management

## Goal

Multi-tenant architecture.

## Deliverables

- [ ] Tenant creation
- [ ] Tenant settings
- [ ] Tenant invitation flow, including email delivery and expiry/revocation
- [ ] Membership management
- [ ] Tenant roles
- [ ] Permission enforcement

## Exit Criteria

- [ ] Multiple tenants operate independently

---

# Version 0.3.0 - Customer Management

## Goal

CRM foundation.

## Deliverables

- [ ] Customer CRUD
- [ ] Customer status management
- [ ] Customer contacts, notes and history
- [ ] Customer tags and tag filtering
- [ ] Customer search
- [ ] Customer filtering

## Exit Criteria

- [ ] Customer lifecycle fully manageable

---

# Version 0.4.0 - Project Management

## Goal

Project tracking system.

## Deliverables

- [ ] Project CRUD
- [ ] Project members
- [ ] Project status management
- [ ] Project ownership

## Exit Criteria

- [ ] Teams can organize projects

---

# Version 0.5.0 - Task Management

## Goal

Work execution tracking.

## Deliverables

- [ ] Task CRUD
- [ ] Task assignment
- [ ] Task priorities
- [ ] Task statuses
- [ ] Task comments
- [ ] Task filtering

## Exit Criteria

- [ ] End-to-end task workflow operational

---

# Version 0.6.0 - File Attachments

## Goal

Centralized file management.

## Deliverables

- [ ] Upload files
- [ ] Download files
- [ ] Delete files
- [ ] Entity attachment support
- [ ] Storage abstraction layer

## Exit Criteria

- [ ] Files can be attached throughout the platform

---

# Version 0.7.0 - Notifications

## Goal

User awareness and communication.

## Deliverables

- [ ] Notification templates
- [ ] In-app notifications
- [ ] Notification preferences (optional under the SRS)
- [ ] Read tracking

This milestone covers in-app notifications. Account/invitation email delivery belongs to the identity/tenant milestones; billing alerts belong to billing. General notification emails, delivery tracking, digests, live updates and push remain later enhancements.

## Exit Criteria

- [ ] Important system events generate notifications

---

# Version 0.8.0 - Subscription & Billing

## Goal

Monetization system.

## Deliverables

- [ ] Subscription plans
- [ ] Tenant subscriptions
- [ ] Billing records
- [ ] Payment records
- [ ] Usage tracking
- [ ] Required billing alert delivery
- [ ] Tenant subscription/usage summaries

Operational task/member/project/activity summaries remain MVP reporting work in the [implementation roadmap](../../docs/init/ROADMAP.md#milestone-11--reporting-and-dashboarding). Revenue, retention and advanced productivity analytics remain later enhancements; the placeholder frontend dashboard is not their implementation.

## Exit Criteria

- [ ] SaaS monetization workflow complete

---

# Version 0.9.0 - Audit & Administration

## Goal

Operational readiness.

## Deliverables

- [ ] Audit logging
- [ ] Admin accounts
- [ ] Admin roles
- [ ] Tenant suspension
- [ ] System settings
- [ ] Announcements

Feature-flag administration and rollout controls remain in the [future backlog](FUTURE-ROADMAP.md#platform-enhancements), following the SRS future-safe scope. Core administration and basic settings remain in this milestone.

## Exit Criteria

- [ ] Administrative operations manageable

---

# Version 1.0.0 - Production Release

## Goal

Stable public release.

## Deliverables

- [ ] Bug fixing
- [ ] Security review
- [ ] Performance optimization
- [ ] API documentation
- [ ] User documentation
- [ ] Backup strategy
- [ ] Monitoring setup
- [ ] Deployment automation

## Exit Criteria

- [ ] Production-ready SaaS platform
- [ ] First real customers onboarded

---

# Historical Schedule

These June 2026-February 2027 ranges were the original planning estimates. They are retained for provenance only, do not indicate completed work, and are not the schedule for the NestJS restart. Replan dates separately when implementation scope and capacity are known.

| Release | Original start | Original end |
| --- | --- | --- |
| 0.0.0 - Foundation | 2026-06-16 | 2026-06-30 |
| 0.1.0 - Authentication | 2026-07-01 | 2026-07-21 |
| 0.2.0 - Tenant Management | 2026-07-22 | 2026-08-11 |
| 0.3.0 - Customer Management | 2026-08-12 | 2026-08-25 |
| 0.4.0 - Project Management | 2026-08-26 | 2026-09-15 |
| 0.5.0 - Task Management | 2026-09-16 | 2026-10-13 |
| 0.6.0 - File Attachments | 2026-10-14 | 2026-10-27 |
| 0.7.0 - Notifications | 2026-10-28 | 2026-11-10 |
| 0.8.0 - Subscription & Billing | 2026-11-11 | 2026-12-08 |
| 0.9.0 - Audit & Administration | 2026-12-09 | 2026-12-29 |
| 1.0.0 - Production Release | 2026-12-30 | 2027-02-09 |

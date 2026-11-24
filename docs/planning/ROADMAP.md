# Delivery roadmap

TenantFlow is a modular SaaS learning project. This page shows delivery order, not a task backlog.
The [SRS](../requirements/TenantFlow-SRS.md#24-canonical-release-boundaries) owns release scope.

## Current state

The Nest backend supports protected local registration on the existing auth schema.
Automated checks pass; actual browser acceptance remains separate.
The Next.js frontend still uses Stack Auth. Tenant-owned business APIs are not implemented.

## Delivery sequence

1. Foundation: application setup, configuration, PostgreSQL and reviewed migrations.

2. Identity: registration, login, session resolution, caller read and logout.

3. Tenant model: organizations and membership with server-enforced isolation.

4. Authorization: tenant/project roles and permissions.

5. Billing: plans, limits and test-mode provider integration.

6. Customers and contacts: tenant-owned business records.

7. Projects and tasks: assignments, status and collaboration.

8. Files: ownership metadata, authorized access and storage integration.

9. Notifications: persisted delivery/read state; optional live transport is separate.

10. Audit: retained actor, tenant, target, action and time.

11. Reporting and dashboarding: operational summaries over implemented data.

12. Production readiness: deployment-specific security, recovery and observability.

13. Deployment: verified frontend/API/database operation in the selected environment.

14. Portfolio documentation: accurate setup, architecture and usage examples.

## Using this sequence

Deliver a small usable feature with the validation, integrity and tests it needs.
A schema, template screen or SDK does not establish a completed product feature.
Detailed PR plans and proposed cases belong in the chat and tests.

Development-only Swagger/OpenAPI supports testing the implemented API; see the backend guide for usage.
Hosting remains undecided; the local topology is not a production deployment design.

See the [backend guide](../../backend/README.md) for commands and the
[coverage summary](VALIDATION.md) for observed verification.

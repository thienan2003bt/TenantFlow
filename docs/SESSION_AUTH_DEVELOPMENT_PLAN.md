# Session authentication overview

The backend owns local accounts and credentials. The frontend still uses Stack Auth.
This page explains the current structure; implementation plans belong in the chat.

## Current behavior

Registration is implemented and covered by automated HTTP and PostgreSQL tests.
It creates a pending account, preserves credentials on duplicate input and creates no session.
Actual browser acceptance is separate from those automated results.

Login, caller read, session renewal and logout are not implemented.
Their accepted behavior is defined in the
[auth contract](requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract).

## Request path

Shared HTTP setup applies CORS, native CSRF and body checks.
The registration guard limits admitted requests before the global pipe creates RegisterDto.
RegistrationService checks the blocklist, hashes the exact password and writes both records in one transaction.
Filters return fixed safe errors; passwords and database details stay out of responses and logs.

Feature code is in backend/src/auth/. Shared transport setup is in backend/src/http/,
and global validation is in backend/src/validation/.

## Reading order

Use the [backend guide](../backend/README.md) to run or test the application.
Use the [coverage summary](planning/VALIDATION.md) to understand what has been checked.
The [persistence mapping](requirements/BACKEND_REQUIREMENTS.md#minimal-auth-persistence-mapping)
defines stored fields and invariants.

Swagger/OpenAPI is a possible next PR, separate from registration.

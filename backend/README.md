# TenantFlow backend

This NestJS application uses PostgreSQL, TypeORM, Argon2id and global DTO validation.
It exposes GET /, GET /health-check and POST /auth/register.
The health endpoint reports process liveness, not database readiness.

## Local configuration and commands

Use Node.js compatible with the lockfile; the verified development runtime is 24.21.0.
Run commands from TenantFlow/backend/. npm.cmd avoids PowerShell shim restrictions.

The application reads backend/.env. Process environment variables override it.
Required settings are NODE_ENV, PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD and DB_NAME.
Both ports must be integers from 1 to 65535.

Example local settings:

~~~dotenv
NODE_ENV=development
PORT=14400
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tenantflow
DB_PASSWORD=tenantflow_password
DB_NAME=tenantflow_dev
~~~

Preserve existing settings when creating .env from .env.example.
The root .env belongs to Compose; frontend/.env.local belongs to Next.js.

Start PostgreSQL from the repository root if needed:

~~~powershell
docker compose up -d --wait --wait-timeout 90 postgres
~~~

Start the API from backend/:

~~~powershell
npm.cmd run start:dev
~~~

The API binds 127.0.0.1 and the configured PORT, normally 14400.
Use http://localhost:14400 from a browser.
InitialAuth must already be applied to the selected database; startup does not apply migrations.
Use the [migration guide](src/database/migrations/README.md) before schema operations.

## Registration

POST /auth/register accepts only email and password string fields in a JSON object.
Valid new and duplicate requests return 202 with:

~~~json
{ "message": "Registration request accepted." }
~~~

New accounts are pending_verification. User and credential inserts are atomic.
Duplicates preserve the existing account and password.
Registration issues no session cookie and sends no email.
The [auth contract](../docs/requirements/BACKEND_REQUIREMENTS.md#accepted-initial-session-auth-contract)
owns exact input and persistence rules.

Shared request processing runs security/media/body checks, then the registration guard, global DTO validation
and the service. The service checks the blocklist, hashes the exact password and opens the transaction.

The local policy permits credentialed CORS only from http://localhost:3000 and uses native Nest CSRF protection.
Auth writes require JSON, identity encoding and a body no larger than 16 KiB.
Registration admits five requests per direct socket IP per hour, including DTO-invalid requests.
Earlier CSRF/parser/media failures do not count. Forwarded IP headers are ignored.

A 429 includes a browser-readable Retry-After. Counter state resets when the API process restarts.
Auth responses use no-store and fixed safe error bodies; passwords, hashes and SQL are not returned or logged.

## Browser check

The requesting page must be http://localhost:3000 in a normal top-level browser tab.
Origin null identifies an opaque context, such as a sandboxed or local-file page.
Browser local-network protection may block such a request before it reaches the API.

1. Stop any frontend/test server using port 3000. Leave PostgreSQL running.

2. Start or restart the API above for a fresh attempt window.

3. In another terminal, from backend/, run:

~~~powershell
node scripts/auth-browser-check.mjs
~~~

4. Navigate the address bar to http://localhost:3000. Do not open a saved HTML file or blank page.

5. Confirm Origin: http://localhost:3000 and Secure context: true on the page.

6. Click Check API connection. Expect 200 and Service is healthy!.

7. Click Run six registration checks once. Expect 202, 202, 400, 400, 400, 429.

The sequence uses test credentials and creates one pending account in the local database.
It covers new/duplicate input, weak/blocked passwords, unknown fields and throttling.

The page already defines registerAuth and browserCredentials for console use.
Select its top-level execution context. Check context before a manual request:

~~~javascript
({ url: location.href, origin: location.origin, secure: isSecureContext })
~~~

In Network, inspect the JSON preflight, exact allowed origin, credential grant and no-store header.
Registration must not set a TenantFlow session cookie.
The existing frontend form and Stack Auth cookies are separate from this endpoint.

Stop the API and check-page servers you started with Ctrl+C afterward. Preserve PostgreSQL volumes.
See [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts).

## Development checks

~~~powershell
npm.cmd run check
npm.cmd run test:db
~~~

check runs typecheck, lint, formatting, unit/HTTP/hook tests, Nest build and compiled blocklist smoke.
It does not connect to PostgreSQL.

test:db creates a uniquely named PostgreSQL 17 container with independent test settings and temporary storage.
It removes the container on pass or failure. Never substitute a development database for this suite.
The [coverage summary](../docs/planning/VALIDATION.md) explains what these results establish.

Other useful commands:

- npm.cmd run build: compile through Nest and copy assets.

- npm.cmd run start:prod: run the compiled application after building.

- npm.cmd run format: apply formatting; format:check verifies it.

- npm.cmd run test:blocklist:build: verify compiled blocklist assets and loading.

The backend pre-commit gate runs lint, unit tests and HTTP tests when backend paths are staged.
It does not run database tests or modify the Git index.

## Code boundaries

ValidationModule registers APP_PIPE once. Controllers use concrete DTO classes with plain @Body().
DTO constraints reuse the email/password functions in auth-input.ts.
Reserved and inherited Object-method keys are rejected before transformation can discard them.
Non-HTTP callers validate through RegisterDto.fromUnknown before calling RegistrationService.

The service owns blocklist policy, hashing and the transaction.
Only the precise canonical-email unique conflict is accepted as a duplicate.
Recognized transaction connection failures become PersistenceUnavailableError with the original cause retained.
The filter returns 503 for that marker and 500 for unsupported failures. Transactions are not retried.

PasswordBlocklistService loads checksum-pinned local assets at construction and fails closed on invalid data.
It uses exact strings and performs no runtime downloads.
The [asset guide](src/auth/data/password-blocklist/README.md) owns provenance, license and updates.

Runtime and migration CLI share explicit registrations. Keep synchronize and migrationsRun false.
Build through Nest, which performs the chosen alias rewrite.
The @enums/environment.enum.ts source alias depends on the ordered tsconfig paths mapping.

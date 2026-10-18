# Build the minimum NestJS application in /backend

Reviewed 18 October 2026 · Developer implementation guide · Backend not yet created

[Documentation index](../README.md) · [Engineering conventions](../architecture/BACKEND_CONVENTIONS.md) · [Backend requirements](../requirements/BACKEND_REQUIREMENTS.md)

You write the application; I provide instructions, reviews and feedback. The commands below are for you to run. This document does not create backend files or claim the application has been tested.

The finish line for this guide is precise: start Nest from `backend/`, request `GET http://127.0.0.1:3001/health-check`, and receive **HTTP 200 OK** with `{"status":"ok"}`. PostgreSQL, authentication, business features, Docker and deployment are later milestones. They are not prerequisites for this first endpoint.

## 1. Create the project inside backend/

Use a supported Node.js 24 LTS patch and npm. Keep the existing frontend's Node.js 22 setup separate. Check both the CLI and application engine requirements against [Nest's prerequisites](https://docs.nestjs.com/first-steps).

In PowerShell, start in the **TenantFlow repository root**:

```powershell
node --version
npm.cmd --version
npm.cmd view @nestjs/cli version engines
npm.cmd view @nestjs/core version engines
```

After confirming your Node version satisfies those requirements, run:

```powershell
if (Test-Path -LiteralPath backend) { throw 'backend already exists; inspect it before generating anything.' }
$nestCliVersion = (npm.cmd view @nestjs/cli version).Trim()
npx.cmd --package "@nestjs/cli@$nestCliVersion" nest new backend --directory backend --package-manager npm --strict --skip-git --no-observe
Set-Location backend
npm.cmd install @nestjs/config
```

Use TypeScript and the default Express adapter. If prompted for the module system, choose **ESM** and retain the generated import/compiler/test conventions. `--skip-git` keeps the existing repository as the only Git repository; `--no-observe` omits the optional hosted observability integration. The CLI creates the baseline and installs dependencies inside `backend/`. These options are documented in the [official CLI reference](https://docs.nestjs.com/cli/usages).

All remaining npm commands in this guide run from **`TenantFlow/backend/`**. Keep its `package.json`, lockfile, dependencies, Nest/TypeScript/tooling configuration, source and tests there. Keep the generated strict settings and compiler options. Use the lockfile with `npm.cmd ci` on subsequent clean installs.

## 2. Organize a feature module with folders for its responsibilities

Nest recommends [feature modules](https://docs.nestjs.com/modules#feature-modules) that group related controllers and providers. [Controllers](https://docs.nestjs.com/controllers) handle HTTP requests, while injectable [services/providers](https://docs.nestjs.com/providers) hold reusable behavior. Nest does not mandate a universal folder hierarchy named Domain, Application and Infrastructure.

For this project, use a feature module with `controllers/` and `services/` folders inside it. Those folder names are our organization choice; Nest's module registration and dependency injection make the boundaries work.

Create this minimum target structure yourself after generation:

```text
TenantFlow/
|-- backend/                           # Entire Nest application
|   |-- .env                           # Local values, ignored by Git
|   |-- .env.example                   # Safe defaults, tracked
|   |-- package.json
|   |-- package-lock.json
|   |-- nest-cli.json
|   |-- tsconfig.json
|   |-- tsconfig.build.json
|   |-- <generated tooling configs>
|   |-- src/
|   |   |-- main.ts                    # Start HTTP server
|   |   |-- app.module.ts              # Compose configuration and features
|   |   |-- config/
|   |   |   +-- env.validation.ts       # Validate and normalize startup settings
|   |   +-- modules/
|   |       +-- health-check/
|   |           |-- health-check.module.ts
|   |           |-- controllers/
|   |           |   +-- health-check.controller.ts
|   |           +-- services/
|   |               +-- health-check.service.ts
|   +-- test/
|       +-- <generated HTTP test and runner configuration>
|-- frontend/                          # Existing Next.js application
|-- docs/
|-- schemas.ts                         # Provisional reference
|-- enum.ts                            # Provisional reference
+-- docker-compose.yml                 # Existing services
```

The request path will be **HTTP → HealthCheckController → HealthCheckService → JSON response**. `HealthCheckModule` wires the controller and service; `AppModule` imports that feature. Modules organize dependencies rather than adding another request-processing stage.

No repository layer is needed for a health response with no data access. Add DTOs, persistence adapters and shared helpers when a real feature needs them. Keep the provisional root models outside backend compilation. In the generated ESM project, preserve its relative-import convention, including `.js` suffixes where required, and import injected classes as runtime values rather than type-only imports.

## 3. Configure and validate the environment

Create `backend/.env.example` with these safe development defaults:

```dotenv
NODE_ENV=development
PORT=3001
```

Then create your local copy from **`backend/`**:

```powershell
if (!(Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Root ignore rules already ignore nested `.env` files and allow `.env.example`. Preserve those rules if the generator creates a nested `.gitignore`; ensure `backend/.env.example` remains trackable. Root `.env` still belongs to Compose, and `frontend/.env.local` still belongs to Next.js.

In `src/config/env.validation.ts`, write a synchronous exported function named `validateEnvironment`. Give it an input of `Record<string, unknown>` and return the validated configuration. Implement this contract:

| Setting | Default when absent | Validation and normalized result |
| --- | --- | --- |
| `NODE_ENV` | `development` | Accept only `development`, `test` or `production`; return a string. |
| `PORT` | `3001` | Accept a decimal integer from 1 to 65535; convert it to a number before returning it. Reject blank strings, nonnumeric values, fractions and values outside the range. |

Return a configuration object preserving other environment entries and replacing these two keys with their validated values. Throw a clear error naming the invalid setting; avoid printing the whole environment. A custom validator keeps this milestone to one additional package, `@nestjs/config`.

In `src/app.module.ts`, configure `ConfigModule.forRoot()` in the module's `imports` with:

- `isGlobal: true`, so the application can inject `ConfigService`.
- `envFilePath: '.env'`, resolved from the `backend/` working directory used throughout this guide.
- `validate: validateEnvironment`, using the function you wrote.

Nest documents this [custom validation hook](https://docs.nestjs.com/techniques/configuration#custom-validate-function): throwing stops bootstrap, and the returned object can contain normalized values. Process environment settings override env-file values. A `ConfigService` generic type alone does not turn an environment string into a number; your validator must do that work.

**Check before continuing:** identify where `PORT` becomes a number and where invalid configuration stops startup. Do not add database URLs or provider secrets before this application has consumers for them.

## 4. Implement and register the health feature

Write these three files in order. The names below identify the classes and methods to implement; you author their bodies.

| File under `backend/src/` | What you implement |
| --- | --- |
| `modules/health-check/services/health-check.service.ts` | Export an `@Injectable()` class named `HealthCheckService`. Give it a synchronous `getStatus()` method returning an object with exactly `status: 'ok'`. Use an explicit return type. |
| `modules/health-check/controllers/health-check.controller.ts` | Export `HealthCheckController`, decorated with `@Controller('health-check')`. Constructor-inject `HealthCheckService`. Add a parameterless `@Get()` handler named `check()` that returns the result of `getStatus()`. |
| `modules/health-check/health-check.module.ts` | Export `HealthCheckModule`, decorated with `@Module()`. Register `HealthCheckController` in `controllers` and `HealthCheckService` in `providers`. No provider export is needed because no other feature consumes this service. |

Import `Controller`, `Get`, `Injectable` and `Module` from `@nestjs/common` in the files that use them. Use normal class imports for the service that Nest must inject. Finally, add `HealthCheckModule` to `AppModule`'s `imports`, alongside configured `ConfigModule`.

Nest returns **200** for a normal successful GET handler and serializes the returned object as JSON. Use Nest-managed responses; no raw Express response, manual `res.send`, custom interceptor or explicit status decorator is required. See the official [controller response handling](https://docs.nestjs.com/controllers#routing) and [module metadata](https://docs.nestjs.com/modules).

This service is a small dependency-injection exercise that makes the controller/service boundary visible. Its status reports HTTP liveness only; it does not claim database or identity-provider readiness. Dependency checks can be added later following [Nest's health-check guidance](https://docs.nestjs.com/recipes/terminus).

Once this feature is wired, remove the generated Hello World controller/service and their registrations. Remove or update their sample unit test, and update the generated HTTP test rather than leaving assertions for the removed `/` response.

## 5. Wire bootstrap to the validated port

In `backend/src/main.ts`, retain the generated async bootstrap pattern and implement this sequence:

1. Create the application with `NestFactory.create(AppModule)`.
2. Obtain `ConfigService` from the created application using `app.get(ConfigService)`.
3. Read `PORT` using `getOrThrow<number>('PORT')`. Your environment validator supplies the actual numeric value.
4. Enable graceful shutdown with `app.enableShutdownHooks()`.
5. Await `app.listen(port, '127.0.0.1')` for local development.

Keep Nest's default logger and exception handling for this milestone. Await bootstrap and let startup errors produce a failed process rather than swallowing them. The expected local URL is `http://127.0.0.1:3001/health-check`.

Keep this route public and unversioned. Do not set a global `/api` prefix for this milestone; otherwise the route would become `/api/health-check`. CORS is unnecessary for the terminal/browser-navigation check below; add a deliberate frontend origin policy when you connect the frontend. Input DTO validation belongs with the first endpoint that accepts input.

## 6. Start the application and check the actual response

In terminal A, from **`TenantFlow/backend/`**:

```powershell
npm.cmd run start:dev
```

Wait for Nest's startup logs. Confirm the health route is mapped and there is no configuration, module-resolution, dependency-injection or port error.

In terminal B, run:

```powershell
curl.exe --noproxy "*" -i http://127.0.0.1:3001/health-check
```

Expected response, with additional normal headers omitted:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

You can also open that URL in a browser. The following PowerShell check fails explicitly if the status or JSON body is wrong:

```powershell
$healthResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/health-check' -UseBasicParsing
if ($healthResponse.StatusCode -ne 200) { throw 'Expected HTTP 200.' }
if (($healthResponse.Content | ConvertFrom-Json).status -ne 'ok') { throw 'Expected status ok.' }
```

Stop terminal A with **Ctrl+C** after the check. Then, from `backend/`, verify the generated production path:

```powershell
npm.cmd run build
npm.cmd run start:prod
```

While the production process is running, repeat the same HTTP check in terminal B, then stop it. Use the generated production script and confirm its compiled entry file exists; do not guess the `dist` path or change the compiler just to fit an assumed layout. Keep `backend/` as the working directory so local `.env` loading behaves the same way.

## 7. Check configuration failure and keep one HTTP regression test

With the server stopped, temporarily set an invalid process value from `backend/`:

```powershell
$previousPort = [Environment]::GetEnvironmentVariable('PORT', 'Process')
try {
  $env:PORT = 'invalid'
  npm.cmd run start:prod
  if ($LASTEXITCODE -eq 0) { throw 'Invalid PORT should fail startup.' }
} finally {
  [Environment]::SetEnvironmentVariable('PORT', $previousPort, 'Process')
}
```

The command restores your previous process setting afterward. The expected result is a configuration error before the server listens and a nonzero exit code. Confirm startup succeeds again with valid settings. A production startup check runs once; avoid watch mode for this failure check.

Update the generated e2e test to initialize an application using `AppModule`, request `/health-check`, and assert HTTP 200 plus the complete JSON body `{ status: 'ok' }`. Close the app in teardown. Keep the selected template's runner/import conventions, and use its `test:e2e` script in one-shot mode; if the runner defaults to watching, configure its documented run-once option. The official [Nest testing guide](https://docs.nestjs.com/fundamentals/testing) shows the assembled-application pattern.

After reviewing the generated script, run from `backend/`:

```powershell
npm.cmd run test:e2e
```

## 8. Finish this milestone

| Check | Evidence to record |
| --- | --- |
| Location | Package, lockfile, source, tests and configuration are inside `backend/`. |
| Configuration | Valid settings start the app; invalid `PORT` fails before listening. |
| Module wiring | `AppModule` imports `HealthCheckModule`; controller and service are registered in their owning module. |
| Development | `start:dev` serves `GET /health-check` with 200 and the expected JSON. |
| Production | Build and `start:prod` serve the same response from `backend/`. |
| Regression | The updated HTTP test passes against `/health-check`. |

If you get **404**, check the controller path, GET decorator, module import and accidental global prefix. A **dependency resolution error** usually means a missing provider registration, a wrong import, or an erased type-only class import. **Connection refused** means the server has not bound that address/port; inspect startup first. **EADDRINUSE** means another process owns the configured port. If the app starts on `3000`, check your working directory, environment precedence, validation result and whether bootstrap reads `ConfigService`.

Send your changed backend paths and observed command results for review. I will check wiring, configuration and responsibility boundaries and give feedback; you make the code changes. Completing this guide establishes the minimum runnable Nest application. It does not complete database, authentication, tenant isolation or the broader foundation milestone in the [roadmap](../planning/ROADMAP.md).

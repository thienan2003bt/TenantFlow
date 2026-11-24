# TenantFlow backend

The developer implements this NestJS application. The assistant provides researched instructions, reviews and feedback under [backend agent instructions](AGENTS.md).

This application currently exposes `GET /` (Hello World) and `GET /health-check` (HTTP 200 with the text `Service is healthy!`). The current health endpoint is HTTP liveness only.

`AuthModule` provides `PasswordService` for asynchronous Argon2id hashing and verification. Its current hashing profile uses 64 MiB, two iterations and parallelism one; verification reads the persisted hash's encoded parameters. Its public verification signature is `verify(rawPassword, hashedPassword)`. Registration/login routes, credential persistence, cookies and sessions are not implemented yet.

The first entity example is `src/auth/user.entity.ts`, mapping `User` to the `users` table. It uses TypeORM decorators, a backend-local `UserStatus` enum, explicit snake_case column names, canonical-email uniqueness and account-state/email CHECK constraints. TypeORM operates through repositories/Data Mapper; entity instances do not save themselves. The creating service must supply a UUID and canonicalized email, and explicitly maintain user updates. Timestamp/status defaults take effect during database insertion, not `new User()`.

Keep these three initial entity files directly in `src/auth/`, beside the existing module/service. An `entities/` subdirectory is optional if that feature becomes crowded; a root-wide entity directory would separate mappings from their owning features. The [mapping contract](../docs/requirements/BACKEND_REQUIREMENTS.md#minimal-auth-persistence-mapping) owns exact fields and constraints.

## Local configuration and commands

Use Node.js compatible with the installed Nest/CLI and ESLint versions; recent checks used Node.js 24.21.0. Run commands from **`TenantFlow/backend/`**. For a clean dependency installation, use `npm.cmd ci`.

The application loads `.env` from this working directory. Validation requires `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` and `DB_NAME`; process variables override env-file values. The environment enum allows `development`, `production`, `test` and `provisioning`. Both ports must be integers from 1 to 65535. The documented local HTTP port is `14400`.

Create your local `.env` with safe development values:

```dotenv
NODE_ENV=development
PORT=14400
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tenantflow
DB_PASSWORD=tenantflow_password
DB_NAME=tenantflow_dev
```

The tracked `.env.example` contains these development values, matching the retained Compose PostgreSQL service. Use it to create a local `.env` if one does not exist; preserve existing local settings. Real `.env` values remain ignored by Git. Root `.env` is for Compose, and `frontend/.env.local` is for Next.js.

Start PostgreSQL from the **repository root** before starting Nest:

```powershell
docker compose up -d --wait --wait-timeout 90 postgres
```

`AppModule` validates configuration once, then imports `DatabaseModule`. That module injects `ConfigService` and uses `database.options.ts` to configure TypeORM. Nest manages the connection lifecycle. `User`, `PasswordCredential`, `Session` and the initial auth migration are registered in shared runtime/CLI options; synchronization and startup migrations remain disabled. Registration does not apply the migration or create its tables. Add `TypeOrmModule.forFeature([User])` in the consuming feature module when introducing an injected `Repository<User>`; no repository consumer is implemented yet. See [Nest's TypeORM integration](https://docs.nestjs.com/data/typeorm) and [TypeORM entities](https://typeorm.io/docs/entity/entities/).

Start development mode:

```powershell
npm.cmd run start:dev
```

Check the existing endpoint from another terminal:

```powershell
curl.exe --noproxy "*" -i http://127.0.0.1:14400/health-check
```

Build and start compiled output:

```powershell
npm.cmd run build
npm.cmd run start:prod
```

The current bootstrap omits an explicit listening host and enables unrestricted CORS. The printed localhost URL does not restrict exposure.

## Database migrations

The standalone migration DataSource reuses the database validator and options builder without starting Nest. Read the [migration guide](src/database/migrations/README.md) for the named commands, target checks, registration, SQL review and data/history safeguards. Keep that detailed workflow in the guide.

InitialAuth is generated and registered alongside the three auth entities. Database execution and constraint/rollback evidence remain tracked in the [validation register](../docs/planning/VALIDATION.md); the [roadmap](../docs/planning/ROADMAP.md#current-priorities-and-learning-preferences) owns the next small PR. No migration is applied automatically at startup.

## Formatting and checks

Backend Prettier configuration uses double quotes for imports, `printWidth: 120`, two spaces per indentation level (`tabWidth: 2`, `useTabs: false`) and explicit LF line endings (`endOfLine: "lf"`), matching `backend/.gitattributes`. Existing CRLF working files still need formatting even when Git stores LF in the index; see [Prettier's line-ending option](https://prettier.io/docs/options#end-of-line). `printWidth` is Prettier's wrapping preference, not a hard limit on every line. Run formatting after editing or generation:

```powershell
npm.cmd run format
```

When using the Nest CLI, append `--format`, for example `npx.cmd --no-install nest generate module tenants --format`, so the generator applies the local Prettier configuration immediately. The [CLI reference](https://docs.nestjs.com/cli/usages#nest-generate) documents this flag; `format:check` catches remaining formatting differences.

The existing `backend/.vscode/settings.json` selects double quotes for auto-imports and Prettier on save **when `backend/` is opened as the VS Code workspace** and the Prettier extension is installed. Nested VS Code settings do not apply automatically when opening only the repository root; the formatter and scripts still read the backend Prettier configuration. Prettier may choose another delimiter for ordinary strings to reduce escaping; import specifiers here use double quotes.

Run the complete existing verification sequence from `backend/`:

```powershell
npm.cmd run check
```

This runs typecheck, lint, formatting verification, unit tests, HTTP smoke tests, hook-runner tests and Nest build, in that order. It stops at the first failure and does not apply fixes. The build writes compiled output under `dist/`. No PostgreSQL connection, migration, auth flow or browser behavior is verified by this command. The script uses npm's standard [run-script behavior](https://docs.npmjs.com/cli/v11/commands/npm-run/).

Individual checks remain available:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run format:check
npm.cmd test
npm.cmd run test:e2e
```

ESLint uses its flat configuration and the TypeScript recommended rules, with type-aware floating-promise checks. Unit tests cover Hello World, configuration validation and the password primitive. Password tests use real Argon2 for encoded algorithm/work factors, match/mismatch, independent salts, spaces, Unicode, persisted work factors and malformed hashes. A separate error suite injects library failures to verify preserved causes. Configuration tests cover numeric conversion, inherited database rules, missing/invalid settings and password redaction.

The HTTP smoke suite supplies synthetic configuration and overrides the TypeORM DataSource; it checks HTTP assembly without connecting to a developer's database. Its success does not verify PostgreSQL connectivity, migrations, health readiness or authentication routes. Real database integration must use an isolated PostgreSQL database when added. Actual results and any failed checks belong in the [validation register](../docs/planning/VALIDATION.md).

## Pre-commit checks

The tracked hook at `.githooks/pre-commit` invokes the backend's Node runner. It reads **staged** paths with `git diff --cached`, including deletions and both sides of renames. With no `backend/` changes it exits immediately. Otherwise it runs these commands from `backend/`, in order:

1. `npm run lint` — ESLint without auto-fixes; any warning or error fails.
2. `npm test` — Nest unit tests in one-shot mode.
3. `npm run test:e2e` — Nest e2e tests in one-shot mode.

Any failure stops the commit. Frontend commands are never run. The checks examine the backend working tree; if you partially stage a file, they do not create a staged snapshot or stash your other edits. They do not install dependencies, auto-fix or stage files.

**Activate once per clone**, from the **repository root**:

```powershell
git config --local core.hooksPath .githooks
```

Git configuration changes are left to the developer under repository policy; preparing the tracked hook does not activate it automatically. On Linux/macOS also run `chmod +x .githooks/pre-commit` before use. Hook files use LF line endings for Git's shell, including Git for Windows. Node and npm must be available to the Git client.

After installing backend dependencies, manually check the hook from the repository root with `node backend/scripts/pre-commit.mjs`. It skips when no backend changes are staged and runs the checks when backend paths are staged. Run `npm.cmd run test:hook` from `backend/` for the runner's path-gating and failure-propagation tests without changing the Git index.

The setup follows [Git's pre-commit hook contract](https://git-scm.com/docs/githooks#_pre_commit), [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files), and [typescript-eslint guidance](https://typescript-eslint.io/getting-started/).

## Enum imports and compiled output

Source code can use the requested spelling:

```typescript
import { Environment } from "@enums/environment.enum.ts";
```

`tsconfig.json` deliberately maps `@enums/*.ts` to **two ordered candidates**: `./src/enums/*.js`, then `./src/enums/*`. Under NodeNext, TypeScript resolves the first candidate to the corresponding TypeScript source using extension substitution. Nest's installed path transformer resolves the second source candidate and emits a relative `.js` import. Keeping both candidates permits the exact `.ts` alias without disabling diagnostics or adding a runtime loader.

Build through `npm.cmd run build` / the Nest CLI: plain `tsc` does not rewrite aliases, and plain Node does not understand the source alias. The existing Vite 8/Vitest configurations already enable `resolve.tsconfigPaths`. Type checking, build, compiled startup, watch startup and the existing test suites were verified with this mapping. Recheck them if changing the compiler, CLI, module system or path mapping.

These choices follow [TypeScript's paths and extension-resolution rules](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths), [Nest CLI compilation](https://docs.nestjs.com/cli/usages#nest-build), [Vite path resolution](https://vite.dev/config/shared-options.html#resolve-tsconfigpaths), and [Prettier options](https://prettier.io/docs/options#quotes). The exact `.ts` alias is a project preference; it is not a Nest requirement. The completed setup walkthrough has been retired.

The framework is [NestJS](https://nestjs.com/), distributed under its [MIT license](https://github.com/nestjs/nest/blob/master/LICENSE).

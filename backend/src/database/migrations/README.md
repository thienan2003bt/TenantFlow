# Database migrations

This is the canonical migration workflow for TenantFlow developers and agents. It applies to the TypeScript migrations in this directory, their [shared registration](../database.options.ts) and the [compiled CLI DataSource](../data-source.ts). Follow [backend agent instructions](../../../AGENTS.md) and the repository's Git/implementation authority rules.

Use one small, reviewed schema change at a time. Keep the entity change, migration, registration and relevant documentation together in the PR. Product constraints belong in [backend requirements](../../../../docs/requirements/BACKEND_REQUIREMENTS.md); this guide owns the process, not another copy of those constraints.

## Commands and target database

Run commands from **`TenantFlow/backend/`**, not this directory. Install backend dependencies and configure PostgreSQL using the [backend README](../../../README.md#local-configuration-and-commands).

| Command | Effect |
| --- | --- |
| `npm run db:migration:generate -- AddUserProfile` | Compare current entity metadata with the target database and write a timestamped .ts migration here. Does not apply its SQL. |
| `npm run db:migration:show` | List registered migrations and their applied status. May create TypeORM's migration-history table. |
| `npm run db:migration:run` | Execute up() for **all pending registered migrations**, ordered by timestamp. |
| `npm run db:migration:revert` | Execute down() for the **latest applied migration**, not an arbitrary chosen file. This can delete data. |

Every script rebuilds the backend first, loads `backend/.env`, and uses the shared compiled DataSource. Process environment variables override env-file values: verify host, port, database and user before an operation, especially after using a shell for another environment. Keep credentials out of commits and logs. Existing environment variables can select a different database even when the env file looks correct.

Use `npm.cmd` in PowerShell if its execution policy blocks the `npm` shim. Add `-- --help` to any script for wrapper usage without a database connection; the build still runs. Generation takes one name starting with a letter, followed by letters/digits/underscores/hyphens. Paths, extensions and other flags are not accepted. [Package scripts](../../../package.json) and [their wrapper](../../../scripts/migration.mjs) own the exact CLI invocation; update them if the workflow changes. These scripts are local developer tooling, not production deployment automation.

## Make and review a migration

1. **Establish the baseline.** Use a known local or isolated database with the existing migrations applied, then change the intended entities. Generation compares against the actual database, not the previous source commit. An out-of-date database can produce duplicate or unrelated changes. Inspect migration status before proceeding.
2. **Generate one named change.** Use the generate script above. Review the resulting file; the generator writes a proposal, not an approved schema. If it exits with code 1 because there are no changes, inspect the target, entity registration and current schema. Do not reset data to force output.
3. **Review up() and down().** Confirm table/column names, types, nullability, defaults, keys, tenant boundaries, indexes and foreign-key actions against the requirement being introduced. Check that down() reverses only this migration in dependency order. Treat unexpected drops/recreations or unrelated alterations as findings to resolve before execution.
4. **Register explicitly.** Import the generated class into `../database.options.ts` using the source import's `.js` extension and add it to the shared `migrations` array. New files are not auto-registered. Runtime and CLI must load the same classes; avoid globs that load both source and compiled copies. Leave `synchronize: false` and `migrationsRun: false` in place.
5. **Format and check.** Run `npm run format`, then `npm run check`, from `backend/`. Keep LF line endings. The scripts rebuild automatically on the next migration operation. Static checks and the database-stubbed HTTP suite do not establish migration correctness.
6. **Verify with isolated PostgreSQL.** Apply, inspect status/schema, revert, and reapply on a disposable database separate from development/shared data. Exercise the constraints and transaction/rollback behavior needed by the feature. For the initial auth schema this includes uniqueness, valid parent references, restrictive deletion and invalid state/timestamp/digest rejection. Manual evidence is acceptable for the first checkpoint; add repeatable automation incrementally.
7. **Record the result.** Put command, target environment, actual result and remaining limits in the [validation register](../../../../docs/planning/VALIDATION.md); update the [roadmap](../../../../docs/planning/ROADMAP.md) checkpoint. Generation, SQL review, execution and a working application feature are separate completion claims.

For a populated/shared database, also review existing rows, backfill/default behavior, lock duration, application compatibility and a tested backup/recovery plan before a destructive or incompatible change. Plan operations that cannot run inside a transaction explicitly; do not assume a transaction makes every migration reversible. These checks apply to the change being introduced, not as a demand to build unrelated infrastructure first.

## Protect data and migration history

- Preserve existing PostgreSQL volumes and retained audit/billing references. Do not delete the volume, reset a database, enable synchronization/dropSchema, or run schema-sync/drop commands as a migration fix.
- Once a migration has been applied outside an isolated scratch database, preserve its timestamp, class name and SQL; use a new forward migration to correct it. An unapplied, unshared draft can be revised before review. If a shared but unapplied migration needs correction, coordinate the review and baseline with its consumers rather than silently deleting, renumbering or rewriting their copy.
- Keep credentials, password/session secrets and environment-specific fixtures out of migration source. Include non-secret reference data only for an agreed feature/schema requirement. Review data migrations for idempotency/recovery and bounded work where relevant.
- Do not edit migration-history rows or use fake execution to hide a schema/history mismatch. A separately designed reconciliation needs explicit evidence of what actually exists and why history should change.
- Do not use revert as a routine production recovery command. Review down() and the latest applied migration first; InitialAuth down() drops all three auth tables. Use a deliberate forward correction or restoration plan where reversal would destroy required data.
- After a command fails, stop and inspect the error, target, migration status and actual schema before retrying. Do not blindly rerun, fake success or remove history. Preserve diagnostic information without secrets; transaction rollback and partial application must be established rather than assumed.

## Authority and handoff

The existing repository instructions determine who may change files, run database operations or publish Git changes. Reading this guide, reviewing SQL or preparing a PR grants no additional authority. Agents normally provide guidance/review; migration generation, application and reversal remain developer actions unless the current task explicitly authorizes the agent to execute them.

Keep this guide focused on stable procedure. The [backend README](../../../README.md) owns general startup/configuration, the roadmap owns the next small implementation batch, and the validation register owns results/open checks. Merging a migration-foundation PR does not complete registration/login/session behavior or prove unexecuted database checks.

References: TypeORM [generation](https://typeorm.io/docs/migrations/generating/), [registration](https://typeorm.io/docs/migrations/setup/), [execution](https://typeorm.io/docs/migrations/executing/) and [reversal](https://typeorm.io/docs/migrations/reverting/). Package behavior was checked against the installed TypeORM 1.1.2 command implementations; recheck when upgrading the tooling.

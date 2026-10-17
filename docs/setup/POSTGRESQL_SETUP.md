# PostgreSQL Development Setup

The repository retains PostgreSQL 17 in [Compose](../../docker-compose.yml) as optional development storage for the future backend. No migrations or business tables are supplied. Docker with Compose is required; DBeaver is optional.

## Start and verify

Run from the repository root:

```powershell
docker compose up -d --wait --wait-timeout 90 postgres
docker compose ps postgres
docker compose logs postgres
docker compose exec postgres pg_isready -U tenantflow -d tenantflow_dev
docker compose exec postgres psql -U tenantflow -d tenantflow_dev
```

Within psql:

```sql
SELECT version();
SHOW TIMEZONE;
\dt
\q
```

A connection/readiness check verifies PostgreSQL only. An empty application schema is expected until the backend and migrations are implemented.

Compose includes a `pg_isready` health check for this wait. CI uses the same wait and executes `SELECT 1` with SQL errors enabled, then stops services without deleting volumes. This readiness/SQL/cleanup job passed in the Step 7 CI run recorded in the [tracker](../../BACKEND_CLEANUP_PLAN.md#10-step-7-pr-handoff). Local validation used Compose rendering; there is no local Docker engine.

## Connection details

| Setting | Host application / DBeaver | Future container on the Compose network |
| --- | --- | --- |
| Host | `localhost` | `postgres` |
| Port | `5432` | `5432` |
| Database | `tenantflow_dev` | `tenantflow_dev` |
| User | `tenantflow` | `tenantflow` |

The development password is set in Compose. In DBeaver, create a PostgreSQL connection with the host-side values and use **Test Connection**. A future API container must use the service hostname; `localhost` inside that container would refer to itself.

If a client reports an invalid timezone, compare its configured value with the server's `pg_timezone_names` view and select a value the server actually lists. Old client-specific timezone workarounds are not assumed valid for every environment. Do not modify the database or volume to solve a client display setting.

## Persistent data and lifecycle

The `tenantflow_postgres_data` volume is mounted at `/var/lib/postgresql/data`. Its existing name and mount are retained by cleanup. Keep the same Compose project name when reconnecting to existing data.

Useful non-destructive commands from the repository root:

```powershell
docker compose stop postgres
docker compose start postgres
docker compose restart postgres
docker compose down
```

The last command removes this project's containers/network but leaves the named volume. Adding `-v` would remove persistent data; it is not a cleanup or troubleshooting step here. Do not delete the volume to change initialization credentials or to retire application source.

A backend connection string, ORM, migration commands, seed data, and database health endpoint remain future implementation work. See the [backend requirements](../init/BACKEND_REQUIREMENTS.md) and [environment guide](ENV_AND_GITIGNORE_SETUP.md).

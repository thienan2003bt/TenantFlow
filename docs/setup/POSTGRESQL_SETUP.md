# PostgreSQL Development Setup

PostgreSQL 17 in [Compose](../../docker-compose.yml) is the local database target for the NestJS/TypeORM backend. Runtime database wiring exists; feature entities and migrations do not. Docker with Compose runs the server. A Windows pgAdmin client is optional.

The current checkpoint is container health, SQL execution and Windows client access. Nest connection, migration and transaction checks are later increments; passing this checkpoint does not complete persistence or authentication.

## Start and verify

1. Start PostgreSQL from the repository root:

   ```powershell
   Set-Location C:\Workspace\AnTrieu\TenantFlow
   docker compose up -d --wait --wait-timeout 90 postgres
   docker compose ps postgres
   ```

   Expected: successful startup, a running/healthy `postgres` service and host port `5432` mapped to container port `5432`. This starts only PostgreSQL; it does not build the frontend. The first run may need to download the image. Stop at any error and inspect `docker compose logs --tail 100 postgres` before continuing. [Compose startup reference](https://docs.docker.com/reference/cli/docker/compose/up/).

2. Execute SQL inside the container, from the same directory:

   ```powershell
   docker compose exec postgres psql -U tenantflow -d tenantflow_dev -v ON_ERROR_STOP=1 -c "SELECT current_database() AS database_name, current_user AS username, version();"
   ```

   Expected: database `tenantflow_dev`, user `tenantflow` and PostgreSQL 17. `ON_ERROR_STOP` makes SQL errors fail the command. This uses the container's bundled client and local socket; Windows needs no separate psql installation for this check. It does not test Windows TCP access or password authentication. [psql reference](https://www.postgresql.org/docs/17/app-psql.html).

3. Check the published port from Windows PowerShell:

   ```powershell
   Test-NetConnection -ComputerName localhost -Port 5432
   ```

   Expected: `TcpTestSucceeded : True`. This proves TCP reachability, not database credentials. The pgAdmin check below verifies a Windows SQL client connection. Historical CI results and outstanding local checks are in the [validation register](../planning/VALIDATION.md#recorded-foundation-checks).

## Connection details

| Setting | Windows Nest / pgAdmin client | Future container on the Compose network |
| --- | --- | --- |
| Host | `localhost` | `postgres` |
| Port | `5432` | `5432` |
| Database | `tenantflow_dev` | `tenantflow_dev` |
| User | `tenantflow` | `tenantflow` |
| Development password | `tenantflow_password` | `tenantflow_password` |

These are the tracked Compose development settings. Existing volumes retain the credentials used when initialized; changing initialization variables does not rewrite existing accounts. A future API container uses `postgres` as its hostname; `localhost` inside that container refers to itself.

## Optional Windows pgAdmin client

1. Install the desktop application from the [official pgAdmin Windows download](https://www.pgadmin.org/download/pgadmin-4-windows/). The PostgreSQL server already runs in Docker; a second Windows PostgreSQL server is unnecessary.
2. Open pgAdmin, right-click **Servers**, and select **Register > Server**.
3. On **General**, set the name to `TenantFlow Local`.
4. On **Connection**, use the Windows values above: host `localhost`, port `5432`, maintenance database `tenantflow_dev`, username `tenantflow` and the development password. Save the connection. If pgAdmin requests a master password for saved credentials, that is separate from the PostgreSQL account password. [Server connection documentation](https://www.pgadmin.org/docs/pgadmin4/latest/server_dialog.html).
5. Select **Databases > tenantflow_dev**, open **Query Tool**, and execute:

   ```sql
   SELECT current_database() AS database_name,
          current_user AS username,
          inet_server_port() AS server_port;
   ```

   Expected: `tenantflow_dev`, `tenantflow` and `5432`. This confirms a PostgreSQL connection through the Windows client and published port. An empty application schema is expected; a TypeORM history table may appear after CLI checks. Schema changes belong to later reviewed migrations.

## Troubleshooting

- **Port 5432 already allocated:** identify the listener with `Get-NetTCPConnection -LocalPort 5432 -State Listen` before deciding which service should own the port.
- **Connection refused or timed out:** check Docker Desktop, `docker compose ps postgres`, logs and the published-port result. A healthy process inside a container does not alone establish Windows access.
- **Password authentication failed:** compare the client settings with the initialized database. Preserve the volume while diagnosing credentials.
- **pgAdmin cannot resolve postgres:** use `localhost` for the Windows desktop client; `postgres` is for the Compose network.

If a client reports an invalid timezone, compare its setting with the server's `pg_timezone_names` view and select a supported value. Adjust the client setting rather than modifying the database or volume for a display issue.

## Persistent data and lifecycle

The `tenantflow_postgres_data` volume is mounted at `/var/lib/postgresql/data`. Keep its name, mount and Compose project name when reconnecting to existing data.

Useful commands from the repository root:

```powershell
docker compose stop postgres
docker compose start postgres
docker compose restart postgres
docker compose down
```

The last command removes this project's containers/network but leaves the named volume. Adding `-v` removes persistent data; preserve the volume during troubleshooting.

After these checks pass, verify Nest and the compiled TypeORM DataSource using the [backend README](../../backend/README.md). Feature migrations, seed data and database readiness remain later work. See the [backend requirements](../requirements/BACKEND_REQUIREMENTS.md) and [environment guide](ENV_AND_GITIGNORE_SETUP.md) for their boundaries.

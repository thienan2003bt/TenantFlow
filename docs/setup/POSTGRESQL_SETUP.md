# PostgreSQL Docker Setup Guide

## Purpose

This guide explains how to set up the local PostgreSQL database for TenantFlow using Docker and connect it with DBeaver.

---

# Prerequisites

Install:

- Docker Desktop
- DBeaver Community Edition
- .NET 8 SDK

Verify Docker:

```bash
docker --version
docker compose version
```

---

# Project Structure

```text
tenantflow/

├── backend/
│   ├── TenantFlow.Api/
│   ├── TenantFlow.Core/
│   ├── TenantFlow.Infrastructure/
│   └── TenantFlow.sln
│
├── docker-compose.yml
└── docs/
```

---

# Docker Compose Configuration

Create `docker-compose.yml` at repository root.

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:17
    container_name: tenantflow-postgres

    restart: unless-stopped

    environment:
      POSTGRES_DB: tenantflow_dev
      POSTGRES_USER: tenantflow
      POSTGRES_PASSWORD: tenantflow_password

    ports:
      - "5432:5432"

    volumes:
      - tenantflow_postgres_data:/var/lib/postgresql/data

volumes:
  tenantflow_postgres_data:
```

---

# Starting PostgreSQL

Start container:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected container:

```text
tenantflow-postgres
```

Check logs:

```bash
docker logs tenantflow-postgres
```

Expected output:

```text
database system is ready to accept connections
```

---

# DBeaver Connection

Create a new PostgreSQL connection.

Configuration:

```text
Host: localhost
Port: 5432

Database: tenantflow_dev

Username: tenantflow
Password: tenantflow_password
```

Press "Test Connection".

---

# Timezone Error Fix

## Symptom

DBeaver may show:

```text
FATAL: invalid value for parameter "TimeZone": "Asia/Saigon"
```

## Cause

The PostgreSQL container does not recognize the legacy timezone identifier:

```text
Asia/Saigon
```

## Solution

Open:

```text
DBeaver
→ Preferences
→ User Interface
→ Time Zones
```

Set timezone to:

```text
Asia/Ho_Chi_Minh
```

or:

```text
Asia/Ho_Chi_Minh_City
```

Restart DBeaver.

Test the connection again.

---

# Application Configuration

## appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": ""
  }
}
```

## appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tenantflow_dev;Username=tenantflow;Password=tenantflow_password"
  }
}
```

---

# Program.cs

```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});
```

---

# Verify Database Connectivity

Open container:

```bash
docker exec -it tenantflow-postgres bash
```

Connect:

```bash
psql -U tenantflow -d tenantflow_dev
```

Verify:

```sql
SELECT version();
```

Exit:

```sql
\q
```

---

# Useful Commands

Start:

```bash
docker compose up -d
```

Stop:

```bash
docker compose stop
```

Restart:

```bash
docker compose restart
```

View logs:

```bash
docker logs tenantflow-postgres
```

Destroy container:

```bash
docker compose down
```

Destroy container and database:

```bash
docker compose down -v
```

Warning:

```bash
docker compose down -v
```

removes all PostgreSQL data permanently.

---

# Expected Result

After setup:

- PostgreSQL runs inside Docker.
- DBeaver connects successfully.
- ASP.NET Core uses `DefaultConnection`.
- Entity Framework migrations can be executed.
- Database tables are visible from DBeaver.

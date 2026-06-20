# TenantFlow Backend Dependencies

**Version:** 0.0.0 Foundation

**Last Updated:** June 2026

**Target Framework:** .NET 8 LTS

---

# Purpose

This document defines all approved package versions for the TenantFlow backend.

All developers should use the versions listed here to avoid:

- Dependency conflicts
- Build failures
- Version mismatches
- Incompatible Entity Framework providers

---

# Technology Stack

| Category             | Technology               |
| -------------------- | ------------------------ |
| Runtime              | .NET 8 LTS               |
| Web API              | ASP.NET Core 8           |
| ORM                  | Entity Framework Core 8  |
| Database             | PostgreSQL 17            |
| Database Provider    | Npgsql EF Core Provider  |
| API Documentation    | Swagger / OpenAPI        |
| Dependency Injection | Built-in ASP.NET Core DI |
| Containerization     | Docker                   |
| Database Management  | DBeaver                  |

---

# Solution Structure

```text
TenantFlow.sln

├── TenantFlow.Api
├── TenantFlow.Core
└── TenantFlow.Infrastructure
```

---

# Package Version Policy

## Rules

### Use Explicit Versions

Always specify package versions:

```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.17
```

Avoid:

```bash
dotnet add package Microsoft.EntityFrameworkCore
```

because NuGet may install a newer incompatible version.

---

### Stay Within .NET 8 Ecosystem

Approved major versions:

| Component             | Version Family |
| --------------------- | -------------- |
| .NET SDK              | 8.x            |
| ASP.NET Core          | 8.x            |
| Entity Framework Core | 8.x            |
| Npgsql EF Provider    | 8.x            |

Do not mix:

```text
.NET 8
EF Core 10
Npgsql 10
```

---

# TenantFlow.Core

## Purpose

Contains:

- Entities
- Enums
- DTOs
- Interfaces
- Domain Services
- Business Rules

## Package Policy

Current version:

```text
No external packages required.
```

The Core project should remain lightweight.

Avoid:

- Entity Framework references
- ASP.NET references
- Database providers

---

# TenantFlow.Infrastructure

## Purpose

Contains:

- ApplicationDbContext
- Entity Configurations
- Repositories
- Data Services
- External Integrations

## Required Packages

### Entity Framework Core

```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.17
```

Current approved version:

```text
8.0.17
```

---

### Entity Framework Design

Required for migrations.

```bash
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.17
```

Current approved version:

```text
8.0.17
```

---

### Entity Framework Tools

Required for CLI commands.

```bash
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.17
```

Current approved version:

```text
8.0.17
```

---

### PostgreSQL Provider

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.11
```

Current approved version:

```text
8.0.11
```

---

## Verification

Run:

```bash
dotnet list package
```

Expected:

```text
Microsoft.EntityFrameworkCore
Microsoft.EntityFrameworkCore.Design
Microsoft.EntityFrameworkCore.Tools
Npgsql.EntityFrameworkCore.PostgreSQL
```

---

# TenantFlow.Api

## Purpose

Contains:

- Controllers
- Minimal APIs
- Middleware
- Dependency Injection
- Authentication
- Application Configuration

## Required Packages

### Swagger

Usually included by default when creating a Web API project.

Verify:

```bash
dotnet list package
```

Expected:

```text
Swashbuckle.AspNetCore
```

---

### Entity Framework Runtime

Required because Program.cs calls:

```csharp
builder.Services.AddDbContext<ApplicationDbContext>()
```

Install:

```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.17
```

Current approved version:

```text
8.0.17
```

---

### PostgreSQL Provider

Required for:

```csharp
options.UseNpgsql(...)
```

Install:

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.11
```

Current approved version:

```text
8.0.11
```

---

# Project References

## Infrastructure → Core

```bash
cd TenantFlow.Infrastructure

dotnet add reference ../TenantFlow.Core/TenantFlow.Core.csproj
```

---

## Api → Infrastructure

```bash
cd TenantFlow.Api

dotnet add reference ../TenantFlow.Infrastructure/TenantFlow.Infrastructure.csproj
```

---

# Verification Checklist

Before committing code:

```bash
dotnet restore
```

```bash
dotnet build
```

```bash
dotnet test
```

Verify:

- No package downgrade warnings
- No package restore failures
- No missing namespace errors
- No incompatible version warnings

---

# Common Errors

## EntityFrameworkCore Namespace Not Found

Cause:

```text
Microsoft.EntityFrameworkCore package missing.
```

Fix:

```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.17
```

---

## UseNpgsql Not Found

Cause:

```text
Npgsql.EntityFrameworkCore.PostgreSQL package missing.
```

Fix:

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.11
```

---

## DbContext Not Found

Cause:

```text
Entity Framework runtime package missing.
```

Fix:

```bash
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.17
```

---

## Migration Commands Fail

Cause:

```text
EntityFrameworkCore.Tools package missing.
```

Fix:

```bash
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.17
```

---

# Current Approved Dependency Matrix

| Project        | Package                               | Version |
| -------------- | ------------------------------------- | ------- |
| Infrastructure | Microsoft.EntityFrameworkCore         | 8.0.17  |
| Infrastructure | Microsoft.EntityFrameworkCore.Design  | 8.0.17  |
| Infrastructure | Microsoft.EntityFrameworkCore.Tools   | 8.0.17  |
| Infrastructure | Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.11  |
| Api            | Microsoft.EntityFrameworkCore         | 8.0.17  |
| Api            | Npgsql.EntityFrameworkCore.PostgreSQL | 8.0.11  |
| Core           | None                                  | N/A     |

---

# Future Additions

These packages will likely be added in future versions:

## Version 0.1.0

Authentication

```text
Microsoft.AspNetCore.Authentication.JwtBearer
```

---

## Version 0.7.0

Notifications

```text
MailKit
```

---

## Version 0.8.0

Billing

```text
Stripe.net
```

---

## Version 1.0.0

Observability

```text
Serilog
OpenTelemetry
```

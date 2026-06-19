# Common .NET Commands Reference

This document provides a quick reference for common `.NET CLI` commands your team will use when developing TenantFlow.

---

## 📦 Project & Solution Management

### Create a new project

```bash
# Web API project
dotnet new webapi -n ProjectName -f net8.0

# Class library (reusable code)
dotnet new classlib -n ProjectName -f net8.0

# Console app
dotnet new console -n ProjectName -f net8.0
```

### Create a solution file

```bash
# Create solution in current directory
dotnet new sln -n SolutionName
```

### Add projects to solution

```bash
dotnet sln SolutionName.sln add ProjectName/ProjectName.csproj
dotnet sln SolutionName.sln add ProjectName1/ProjectName1.csproj ProjectName2/ProjectName2.csproj
```

### List projects in solution

```bash
dotnet sln SolutionName.sln list
```

---

## 🔨 Building & Running

### Build the project/solution

```bash
# Build current directory
dotnet build

# Build specific project
dotnet build ProjectName/ProjectName.csproj

# Build with release configuration
dotnet build --configuration Release
```

### Run the application

```bash
# Run Web API (starts server)
dotnet run

# Run with specific configuration
dotnet run --configuration Release

# Run from specific project (when in solution root)
dotnet run --project TenantFlow.Api/TenantFlow.Api.csproj
```

### Clean build artifacts

```bash
# Remove build output
dotnet clean

# Remove build output and NuGet packages
dotnet clean && dotnet restore
```

---

## 📚 Package Management (NuGet)

### Install/Add a package

```bash
# Add to current project
dotnet add package PackageName

# Add specific version
dotnet add package PackageName --version 8.0.1

# Add to specific project (from solution root)
dotnet add TenantFlow.Infrastructure/TenantFlow.Infrastructure.csproj package EntityFramework.Core
```

### List installed packages

```bash
dotnet package search PackageName
```

### Update a package

```bash
dotnet add package PackageName --version latest
```

### Remove a package

```bash
dotnet remove package PackageName
```

### Restore all packages

```bash
dotnet restore
```

---

## 📊 Entity Framework Core (Database ORM)

### Initial migration (create first database schema)

```bash
# Create first migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

### Add new migration (after changing DbContext)

```bash
# Create migration with descriptive name
dotnet ef migrations add AddUserTable
dotnet ef migrations add AddPasswordHash

# Apply latest migration
dotnet ef database update
```

### View migrations

```bash
# List all migrations
dotnet ef migrations list

# Show migration script as SQL
dotnet ef migrations script
dotnet ef migrations script MigrationName1 MigrationName2
```

### Remove last migration (if not yet applied to DB)

```bash
dotnet ef migrations remove
```

### Drop database (⚠️ BE CAREFUL - for dev only!)

```bash
dotnet ef database drop --force
```

### Generate migration with specific project

```bash
# From solution root, specify startup and target projects
dotnet ef migrations add InitialCreate \
  --startup-project TenantFlow.Api/TenantFlow.Api.csproj \
  --project TenantFlow.Infrastructure/TenantFlow.Infrastructure.csproj
```

---

## 🧪 Testing

### Run all tests

```bash
dotnet test
```

### Run tests in specific project

```bash
dotnet test TestProjectName/TestProjectName.csproj
```

### Run specific test class

```bash
dotnet test --filter ClassName
```

### Run with detailed output

```bash
dotnet test --verbosity detailed
```

---

## 🔍 Debugging & Diagnostics

### Add project reference (depend on another project)

```bash
# Add Core project reference to Api project
dotnet add TenantFlow.Api/TenantFlow.Api.csproj reference TenantFlow.Core/TenantFlow.Core.csproj
```

### Check dependencies tree

```bash
# Show all dependencies
dotnet nuget locals --help
```

---

## 📋 .gitignore for .NET

Add this to your `.gitignore` to prevent committing build artifacts:

```
# Build artifacts
bin/
obj/
*.dll
*.exe
*.pdb

# User Secrets
**/Properties/launchSettings.json
**/secrets.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local
appsettings.Development.json

# Database
*.db
*.sqlite
*.sqlite3
```

---

## 🚀 Common Workflows

### Setting up new project for first time

```bash
cd backend

# Restore dependencies
dotnet restore

# Build
dotnet build

# Run migrations (if using EF)
dotnet ef database update

# Start development server
dotnet run
```

### After pulling new code from Git

```bash
# Restore any new packages
dotnet restore

# Rebuild
dotnet build

# Apply any new migrations
dotnet ef database update
```

### Adding a new feature

```bash
# 1. Add required NuGet packages
dotnet add package SomePackage

# 2. Update database schema (if needed)
dotnet ef migrations add FeatureName

# 3. Build to check for errors
dotnet build

# 4. Run to test
dotnet run
```

---

## 💡 Tips & Tricks

### View .NET version

```bash
dotnet --version
```

### List installed SDKs

```bash
dotnet --list-sdks
```

### Run dotnet command for specific project (from solution root)

```bash
# Use --project flag
dotnet build --project TenantFlow.Core/TenantFlow.Core.csproj
dotnet run --project TenantFlow.Api/TenantFlow.Api.csproj
```

### Verbosity levels

```bash
dotnet build --verbosity minimal      # Less output
dotnet build --verbosity normal       # Default
dotnet build --verbosity detailed     # More info
dotnet build --verbosity diagnostic   # Very detailed
```

---

## 📖 Documentation Links

- [Official .NET CLI Reference](https://learn.microsoft.com/en-us/dotnet/core/tools/)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)

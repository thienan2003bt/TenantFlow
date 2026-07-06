# Environment Variables & .gitignore Setup

## 🔐 Setting Up .env for Local Development

### Why .env?

Even though .NET has User Secrets, using a `.env` file is important for:

- **Team consistency** - Everyone uses the same file format
- **Docker compatibility** - Easy to pass env vars to containers
- **Production parity** - Production also uses environment variables
- **Simplicity** - Single source of truth for all developers

### Step 1: Create `.env` file in project root

**File: `backend/.env`** (do NOT commit this)

```env
# Application
ENVIRONMENT=Development
API_PORT=5024

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_local_password_123
DATABASE_NAME=tenantflow_dev
DATABASE_CONNECTION_STRING=Server=localhost;Port=5432;Database=tenantflow_dev;User Id=postgres;Password=your_local_password_123;Include Error Detail=true;

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-that-is-very-long-and-random-change-in-production
JWT_EXPIRATION_MINUTES=60
REFRESH_TOKEN_EXPIRATION_DAYS=7

# Email (if implementing email verification later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@tenantflow.dev

# AWS (if implementing file uploads)
AWS_ACCESS_KEY_ID=your_local_aws_access_key
AWS_SECRET_ACCESS_KEY=your_local_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tenantflow-dev-bucket

# Stripe (when implementing billing)
STRIPE_API_KEY=sk_test_your_local_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret

# Optional: API Keys for external services
RECAPTCHA_SECRET_KEY=your_local_recaptcha_key
```

### Step 2: Create `.env.example` (committed to Git)

**File: `backend/.env.example`**

```env
# .env.example - Copy this to .env and fill in your local values

# Application
ENVIRONMENT=Development
API_PORT=5024

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_NAME=tenantflow_dev
DATABASE_CONNECTION_STRING=

# JWT & Security
JWT_SECRET=
JWT_EXPIRATION_MINUTES=60
REFRESH_TOKEN_EXPIRATION_DAYS=7

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=

# Stripe
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Other
RECAPTCHA_SECRET_KEY=
```

---

## 🛡️ Updating .gitignore

### Step 1: Create/Update `.gitignore` in project root

**File: `.gitignore`** (add/update with this content)

```
# Environment Variables
.env
.env.local
.env.*.local
.env.production.local

# .NET Build Artifacts
bin/
obj/
*.dll
*.exe
*.pdb
*.so
*.dylib

# IDE & Editor
.vscode/
.idea/
*.swp
*.swo
*.swn
*~
.DS_Store

# Visual Studio
.vs/
.vscode/settings.json
*.user
*.userprefs
*.pidb
*.suo

# Build Logs
*.log
logs/

# Database
*.db
*.sqlite
*.sqlite3
*.mdf
*.ldf

# Node modules (for frontend, if applicable)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python (if using for scripts)
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/

# NuGet
*.nuget.props
*.nuget.targets
packages/
.nuget/

# Build results
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/

# User Secrets
**/Properties/launchSettings.json
**/secrets.json
user-secrets-id

# Dependencies
.package-lock.json
paket-files/

# OS
Thumbs.db
.DS_Store

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
```

### Step 2: Verify .env is ignored

```bash
# Test that .env is ignored
git check-ignore -v .env

# Should output: .env
```

---

## 📖 Using Environment Variables in Code

### Reading from .env in Program.cs

.NET automatically reads environment variables using `IConfiguration`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// This reads from (in order):
// 1. Environment variables (Windows: set VAR=value)
// 2. appsettings.Development.json
// 3. appsettings.json
// 4. .env (if you set it up)

var databaseUrl = builder.Configuration["DATABASE_CONNECTION_STRING"];
var jwtSecret = builder.Configuration["JWT_SECRET"];
var stripeKey = builder.Configuration["STRIPE_API_KEY"];

// Example: Validate required configuration
if (string.IsNullOrEmpty(jwtSecret))
{
    throw new InvalidOperationException("JWT_SECRET is not configured!");
}

// Add DbContext with the connection string
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(databaseUrl));

// Add other services...
var app = builder.Build();
app.Run();
```

### Using Configuration in Services

```csharp
public class UserService
{
    private readonly IConfiguration _configuration;

    public UserService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public void DoSomething()
    {
        var apiKey = _configuration["STRIPE_API_KEY"];
        // Use the key...
    }
}

// In Program.cs, register it:
builder.Services.AddScoped<UserService>();
```

### Creating a Settings Class (Best Practice)

**File: `TenantFlow.Infrastructure/Settings/DatabaseSettings.cs`**

```csharp
namespace TenantFlow.Infrastructure.Settings;

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
```

**File: `TenantFlow.Infrastructure/Settings/JwtSettings.cs`**

```csharp
namespace TenantFlow.Infrastructure.Settings;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; }
    public int RefreshTokenExpirationDays { get; set; }
}
```

**File: `TenantFlow.Infrastructure/Settings/AppSettings.cs`**

```csharp
namespace TenantFlow.Infrastructure.Settings;

public class AppSettings
{
    public DatabaseSettings Database { get; set; } = new();
    public JwtSettings Jwt { get; set; } = new();
    public AwsSettings Aws { get; set; } = new();
    public StripeSettings Stripe { get; set; } = new();
}
```

**In Program.cs:**

```csharp
var appSettings = new AppSettings();
builder.Configuration.Bind(appSettings);
builder.Services.AddSingleton(appSettings);

// Or shorter:
builder.Services.Configure<AppSettings>(builder.Configuration);

// Then use in services:
public class FileService
{
    private readonly IOptions<AppSettings> _options;

    public FileService(IOptions<AppSettings> options)
    {
        _options = options;
        var s3BucketName = _options.Value.Aws.S3BucketName;
    }
}
```

---

## 🚀 For Different Environments

### Development (Local)

```env
ENVIRONMENT=Development
DATABASE_CONNECTION_STRING=Server=localhost;...
JWT_SECRET=dev-secret-key
```

Load from `.env` file

### Staging (Docker)

```bash
docker run \
  -e ENVIRONMENT=Staging \
  -e DATABASE_CONNECTION_STRING=postgres://prod-db-host:5432/... \
  -e JWT_SECRET=staging-secret-key \
  myapp:latest
```

### Production

Use AWS Secrets Manager or environment variables from your deployment platform (Kubernetes, CloudRun, etc.)

---

## ✅ Checklist

- [ ] Created `.env` in `backend/` with your local values
- [ ] Created `.env.example` with empty values
- [ ] Updated `.gitignore` to exclude `.env`
- [ ] Verified `git check-ignore .env` works
- [ ] Never committed `.env` to Git
- [ ] Shared `.env.example` with team for reference
- [ ] All team members copy `.env.example` to `.env` and fill their local values

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore` immediately
2. **Don't hardcode secrets** - Always read from environment
3. **Rotate secrets regularly** - Especially in production
4. **Use strong random values** - `JWT_SECRET` should be very long and random
5. **Limit access** - Only share `.env` through secure channels (1Password, LastPass, etc.)
6. **Different secrets per environment** - Dev and production keys should be different
7. **Audit logs** - Log who accesses which secrets
8. **Use managed secrets** - AWS Secrets Manager, Azure Key Vault for production

---

## 🐋 Docker Integration

When deploying with Docker:

**File: `docker-compose.yml`**

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "5024:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - DATABASE_CONNECTION_STRING=${DATABASE_CONNECTION_STRING}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_API_KEY=${STRIPE_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Run with .env:**

```bash
docker-compose --env-file .env up
```

---

Now you're ready to use environment variables securely across all environments!

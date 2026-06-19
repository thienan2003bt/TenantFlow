# Building TenantFlow - Core Layer (Authentication & Identity)

## 📚 What is the Core Layer?

The **Core** layer (also called **Domain** layer) contains:

- **Entities**: Database models (User, Role, Permission, etc.)
- **Enums**: Type definitions (UserStatus, AuthFactorType, etc.)
- **DTOs**: Data Transfer Objects (what you send over HTTP)
- **Services**: Business logic (hashing, validation, etc.)
- **Interfaces**: Contracts for repositories and services

**Think of it like:** The "rules" of your business. It's independent of databases, HTTP, or any external dependency.

---

## 🏗️ Architecture Pattern

```
TenantFlow.Core (no dependencies on other projects)
├── Entities/           ← Database models
├── Enums/              ← Type definitions
├── DTOs/               ← HTTP request/response objects
├── Services/           ← Business logic (interfaces)
└── Exceptions/         ← Custom exceptions

        ↓ (depends on Core)

TenantFlow.Infrastructure (talks to database)
├── Data/               ← DbContext, configurations
├── Repositories/       ← Database access logic
├── Migrations/         ← Database schema changes
└── Services/           ← Service implementations

        ↓ (depends on Infrastructure)

TenantFlow.Api (HTTP layer)
├── Controllers/        ← HTTP endpoints
├── Middleware/         ← Request processing
└── Program.cs         ← Configuration
```

**Key Rule:** Core knows NOTHING about Infrastructure or Api. Infrastructure knows about Core. Api knows about both.

---

## 📝 Step-by-Step Instructions

### Step 1: Create folder structure in TenantFlow.Core

Navigate to your Core project and create these folders:

```powershell
cd E:\PersonalProjects\TenantFlow\backend\TenantFlow.Core

# Create folders
mkdir Entities
mkdir Enums
mkdir DTOs
mkdir DTOs\Requests
mkdir DTOs\Responses
mkdir Services
mkdir Exceptions
```

This gives you:

```
TenantFlow.Core/
├── Entities/          ← Create User.cs, Role.cs, Permission.cs, etc.
├── Enums/             ← Create UserStatus.cs, AuthFactorType.cs, etc.
├── DTOs/
│   ├── Requests/      ← Register.cs, Login.cs, CreateRoleRequest.cs
│   └── Responses/     ← UserResponse.cs, RoleResponse.cs
├── Services/          ← IUserService.cs, IAuthenticationService.cs
└── Exceptions/        ← Custom exceptions
```

---

### Step 2: Create Enums

These are simple value type definitions. Create one file per enum in `Enums/` folder:

**File: `Enums/UserStatus.cs`**

```csharp
namespace TenantFlow.Core.Enums;

public enum UserStatus
{
    Active,
    Inactive,
    PendingVerification,
    Frozen,
    Deleted
}
```

**File: `Enums/AuthFactorType.cs`**

```csharp
namespace TenantFlow.Core.Enums;

public enum AuthFactorType
{
    Password,
    Totp,
    Passkey,
    Biometric,
    SecurityKey
}
```

**File: `Enums/UserTokenType.cs`**

```csharp
namespace TenantFlow.Core.Enums;

public enum UserTokenType
{
    EmailVerification,
    PasswordReset,
    MfaEnrollment,
    MfaChallenge
}
```

**Create similar files for all enums from your enum.ts.** For now, focus on Auth-related ones:

- UserStatus
- AuthFactorType
- UserTokenType
- TenantStatus
- TenantMembershipStatus

---

### Step 3: Create Entities (Domain Models)

These represent database tables. Create files in `Entities/` folder:

**File: `Entities/User.cs`**

```csharp
namespace TenantFlow.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public UserStatus Status { get; set; } = UserStatus.Inactive;
    public Guid? RoleId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    // Navigation properties (for Entity Framework relationships)
    public Role? Role { get; set; }
    public ICollection<UserIdentity> Identities { get; set; } = new List<UserIdentity>();
    public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
    public ICollection<AuthFactor> AuthFactors { get; set; } = new List<AuthFactor>();
    public UserProfile? Profile { get; set; }
    public ICollection<UserToken> Tokens { get; set; } = new List<UserToken>();
}
```

**File: `Entities/Role.cs`**

```csharp
namespace TenantFlow.Core.Entities;

public class Role
{
    public Guid Id { get; set; }
    public string Scope { get; set; } = string.Empty; // "system", "tenant", "project"
    public Guid? TenantId { get; set; }
    public Guid? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
```

**File: `Entities/Permission.cs`**

```csharp
namespace TenantFlow.Core.Entities;

public class Permission
{
    public Guid Id { get; set; }
    public string Scope { get; set; } = string.Empty; // "system", "tenant", "project"
    public Guid? TenantId { get; set; }
    public Guid? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
```

**File: `Entities/RolePermission.cs`**

```csharp
namespace TenantFlow.Core.Entities;

public class RolePermission
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Role Role { get; set; } = null!;
    public Permission Permission { get; set; } = null!;
}
```

**File: `Entities/UserIdentity.cs`** (for OAuth & password storage)

```csharp
namespace TenantFlow.Core.Entities;

public class UserIdentity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Provider { get; set; } // "google", "github", null = local
    public string? ProviderUserId { get; set; }
    public string? PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File: `Entities/UserSession.cs`** (for tracking logged-in sessions)

```csharp
namespace TenantFlow.Core.Entities;

public class UserSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string RefreshTokenHash { get; set; } = string.Empty;
    public string IpAddress { get; set; } = "Unknown";
    public string UserAgent { get; set; } = "Unknown";
    public string DeviceName { get; set; } = "Unknown";
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File: `Entities/AuthFactor.cs`** (for MFA support)

```csharp
namespace TenantFlow.Core.Entities;

public class AuthFactor
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public AuthFactorType Type { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;
    public bool IsEnabled { get; set; } = true;
    public Dictionary<string, object> Metadata { get; set; } = new();
    public DateTime? VerifiedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File: `Entities/UserProfile.cs`** (for user personal info)

```csharp
namespace TenantFlow.Core.Entities;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File: `Entities/UserToken.cs`** (for email verification, password reset, MFA)

```csharp
namespace TenantFlow.Core.Entities;

public class UserToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public UserTokenType Type { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
}
```

**File: `Entities/UserRoleAssignment.cs`**

```csharp
namespace TenantFlow.Core.Entities;

public class UserRoleAssignment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
```

For now, **focus on these Auth-related entities**. You'll add Tenant-related entities once you move to the next version.

---

### Step 4: Create DTOs (Data Transfer Objects)

DTOs are what you send/receive over HTTP. They're usually simpler than entities (no sensitive data, no navigation properties).

**File: `DTOs/Requests/RegisterRequest.cs`**

```csharp
namespace TenantFlow.Core.DTOs.Requests;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PasswordConfirm { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
```

**File: `DTOs/Requests/LoginRequest.cs`**

```csharp
namespace TenantFlow.Core.DTOs.Requests;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

**File: `DTOs/Responses/UserResponse.cs`**

```csharp
namespace TenantFlow.Core.DTOs.Responses;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? AvatarUrl { get; set; }
}
```

**File: `DTOs/Responses/LoginResponse.cs`**

```csharp
namespace TenantFlow.Core.DTOs.Responses;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; } // seconds
    public UserResponse User { get; set; } = new();
}
```

---

### Step 5: Create Custom Exceptions

**File: `Exceptions/ValidationException.cs`**

```csharp
namespace TenantFlow.Core.Exceptions;

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}
```

**File: `Exceptions/NotFoundException.cs`**

```csharp
namespace TenantFlow.Core.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}
```

**File: `Exceptions/UnauthorizedException.cs`**

```csharp
namespace TenantFlow.Core.Exceptions;

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message) { }
}
```

---

### Step 6: Create Service Interfaces

Service interfaces define what business operations are available (implementation will be in Infrastructure).

**File: `Services/IPasswordService.cs`**

```csharp
namespace TenantFlow.Core.Services;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}
```

**File: `Services/ITokenService.cs`**

```csharp
namespace TenantFlow.Core.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateAccessToken(string token);
}
```

**File: `Services/IUserService.cs`**

```csharp
namespace TenantFlow.Core.Services;

public interface IUserService
{
    Task<User> RegisterAsync(string email, string password, string? firstName = null, string? lastName = null);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<bool> UserExistsAsync(string email);
}
```

---

## 🚀 What You Should Do Now

1. **Create the folder structure** in `TenantFlow.Core`
2. **Create all Enum files** in the `Enums/` folder
3. **Create all Entity files** in the `Entities/` folder (the code above)
4. **Create DTO files** in `DTOs/Requests` and `DTOs/Responses`
5. **Create Exception files** in `Exceptions/` folder
6. **Create Service Interface files** in `Services/` folder

Once you've done this, **tell me and we'll move to Infrastructure** to:

- Set up Entity Framework Core
- Create the DbContext
- Configure database connections
- Implement the service interfaces

---

## 💡 Important Notes

- **Namespaces**: Use `TenantFlow.Core.Entities`, `TenantFlow.Core.DTOs.Requests`, etc.
- **Guid vs int**: Use `Guid` for IDs (UUID equivalent), not `int`
- **UTC DateTime**: Always use `DateTime.UtcNow` for timestamps
- **Navigation Properties**: These are `null!` with the null-forgiving operator (`!`) to satisfy C# nullability
- **Collections**: Initialize empty collections with `= new List<T>()` to prevent null reference exceptions

Ready to start? Let me know once you've created the folder structure!

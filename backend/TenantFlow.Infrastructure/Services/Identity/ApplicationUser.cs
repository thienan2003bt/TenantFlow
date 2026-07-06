using Microsoft.AspNetCore.Identity;
using TenantFlow.Core.Enums;

namespace TenantFlow.Infrastructure.Services.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
  public UserStatus Status { get; set; } = UserStatus.Inactive;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
namespace TenantFlow.Core.DTOs.Internal;

/// <summary>
/// Represents the minimum user information required to generate a JWT token.
/// </summary>
public class JwtUser
{
  public Guid Id { get; set; }
  public string Email { get; set; } = string.Empty;
  public string? UserName { get; set; }
  public IList<string> Roles { get; set; } = [];
}
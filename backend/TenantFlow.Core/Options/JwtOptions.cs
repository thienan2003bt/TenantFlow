namespace TenantFlow.Core.Options;

/// <summary>
/// Represents the configuration options for JWT (JSON Web Token) authentication in the application, loaded from the appsettings.json file.
/// </summary>
public class JwtOptions
{

  public const string SectionName = "Jwt";
  public string Issuer { get; set; } = string.Empty;
  public string Audience { get; set; } = string.Empty;
  public string SecretKey { get; set; } = string.Empty;
  public int ExpiryMinutes { get; set; }
}
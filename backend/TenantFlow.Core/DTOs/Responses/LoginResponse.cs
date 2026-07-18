namespace TenantFlow.Core.DTOs.Responses;

public class LoginResponse
{

  public string AccessToken { get; set; } = string.Empty;

  public DateTime ExpiresAt { get; set; }
}
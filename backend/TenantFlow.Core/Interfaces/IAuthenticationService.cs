using TenantFlow.Core.DTOs.Requests;
using TenantFlow.Core.DTOs.Responses;

namespace TenantFlow.Core.Interfaces;

public interface IAuthenticationService
{
  Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    
  Task<LoginResponse> LoginAsync(LoginRequest request);
}
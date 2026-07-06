
using TenantFlow.Core.DTOs.Internal;

namespace TenantFlow.Core.Interfaces;

public interface IJwtTokenService
{
  Task<string> GenerateTokenAsync(JwtUser user);
}
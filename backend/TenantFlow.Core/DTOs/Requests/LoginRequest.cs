using System.ComponentModel.DataAnnotations;

namespace TenantFlow.Core.DTOs.Requests;

public class LoginRequest
{
  [Required]
  [EmailAddress]
  [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")]
  public string Email { get; set; } = string.Empty;

  [Required]
  [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
  public string Password { get; set; } = string.Empty;
}
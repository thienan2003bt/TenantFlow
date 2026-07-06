using System.ComponentModel.DataAnnotations;

namespace TenantFlow.Core.DTOs.Requests;

public class RegisterRequest
{
  [Required]
  [EmailAddress]
  [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")]
  public string Email { get; set; } = string.Empty;

  [Required]
  [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
  public string Password { get; set; } = string.Empty;

  [Required]
  [Compare(nameof(Password), ErrorMessage = "Passwords do not match.")]
  public string ConfirmPassword { get; set; } = string.Empty;
}
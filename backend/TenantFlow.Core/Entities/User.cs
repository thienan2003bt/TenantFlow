using TenantFlow.Core.Enums;

namespace TenantFlow.Core.Entities;
/// <summary>
/// Represents a user in the system with properties for identification,
/// email, status, and timestamps for creation and updates.
/// </summary>
public class User

{
  /// <summary>
  /// Primary key, a unique identifier for the user.
  /// </summary>
  public Guid Id { get; set; }
  /// <summary>
  /// User email address, used for identification and communication.
  /// </summary>
  public string Email { get; set; } = string.Empty;
  /// <summary>
  /// Status of the user account, indicating whether the user is active, inactive, pending verification, frozen, or deleted.
  /// </summary>
  public UserStatus Status { get; set; } = UserStatus.Inactive;
  /// <summary>
  /// The date and time when the user was created.
  /// </summary>
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  /// <summary>
  /// The date and time when the user was last updated.
  /// </summary>
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
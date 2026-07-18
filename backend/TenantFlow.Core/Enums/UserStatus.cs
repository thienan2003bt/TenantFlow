namespace TenantFlow.Core.Enums;

/// <summary>
/// Defines the possible statuses of a user account in the system.
/// Each status represents a different state of the user's account, which can affect their access and permissions within the system.
/// ---
/// ACTIVE: The user is active and can access the system.
/// INACTIVE: The user is inactive and cannot access the system.
/// PENDING_VERIFICATION: The user's account is pending verification, possibly awaiting email confirmation or admin approval.
/// FROZEN: The user's account is frozen, possibly due to security reasons or policy violations.
/// DELETED: The user's account has been deleted and cannot be recovered.
/// </summary>
public enum UserStatus
{
  Active,
  Inactive,
  PendingVerification,
  Frozen,
  Deleted
}
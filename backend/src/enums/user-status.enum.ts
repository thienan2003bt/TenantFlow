/**
 * This enum represents the possible statuses of a user in the system. Each status is represented as a string value.
 *
 * - ACTIVE: The user is active and can access the system.
 * - INACTIVE: The user is inactive and cannot access the system until reactivated.
 * - PENDING_VERIFICATION: The user has registered but has not yet verified their email address.
 * - FROZEN: The user's account is temporarily frozen and cannot access the system until the freeze is lifted.
 * - DELETED: The user's account has been deleted and cannot access the system.
 *
 * This enum is used in the User entity to define the status of a user and enforce constraints on the status field.
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING_VERIFICATION = "pending_verification",
  FROZEN = "frozen",
  DELETED = "deleted",
}

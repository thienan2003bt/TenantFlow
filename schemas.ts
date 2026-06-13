import {
  AuthFactorType,
  TenantCustomerStatusType,
  TenantMembershipStatusType,
  TenantProjectStatusType,
  TenantProjectTaskPriorityType,
  TenantProjectTaskStatusType,
  TenantStatusType,
  UserStatus,
  UserTokenType,
} from "./enum";

export type User = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Unique, not null,
  email: string;
  // Unique, not null, default = `${this.email.split("@")[0]}-${this.id.slice(0, 6)}`
  slug: string;
  // Not null, default = UserStatus.INACTIVE
  status: UserStatus;
  // Foreign key, references Role.id, UUID-typed, nullable
  role_id: string | null;
  // default = null
  verified_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
  // default = null
  deleted_at: Date | null;
};

export type Role = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Indicates whether the role is a system role, or a tenant-specific role, or a project-specific role
  scope: "system" | "tenant" | "project";
  // Foreign key, references Tenant.id, UUID-typed, default = null (means it's a system role that is not associated with any tenant)
  tenant_id: string | null;
  // Foreign key, references Project.id, UUID-typed, default = null (means it's a system role that is not associated with any project)
  project_id: string | null;
  // not null
  name: string;
  // Not null
  description: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type Permission = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Indicates whether the permission is a system permission, a tenant-specific permission, or a project-specific permission
  scope: "system" | "tenant" | "project";
  // Foreign key, references Tenant.id, UUID-typed, default = null (means it's a system permission that is not associated with any tenant)
  tenant_id: string | null;
  // Foreign key, references Project.id, UUID-typed, default = null (means it's a system permission that is not associated with any project)
  project_id: string | null;
  // not null
  name: string;
  // Not null
  description: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type RolePermission = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Role.id, UUID-typed, not null
  role_id: string;
  // Foreign key, references Permission.id, UUID-typed, not null
  permission_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type UserRoleAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Foreign key, references Role.id, UUID-typed, not null, only for system roles
  role_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type UserIdentity = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // default = null (means local authentication)
  provider: string | null;
  // default = null (means local authentication)
  provider_user_id: string | null;
  // Not null unless the provider is NOT local
  password_hash: string | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type UserSession = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Not null
  refresh_token_hash: string;
  // Not null, default = "Unknown" (means the IP address is not available)
  ip_address: string;
  // Not null, default = "Unknown" (means the user agent is not available)
  user_agent: string;
  // Default = "Unknown" (means the device name is not available)
  device_name: string;
  // default = true (means the session is active)
  is_active: boolean;
  // default = null (means the session does not have an expiration time, e.g., for "remember me" sessions)
  expires_at: Date | null;
  // default = null (means the session has not been revoked)
  revoked_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type AuthFactor = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Not null, default = AuthFactorType.PASSWORD
  type: AuthFactorType;
  // Not null
  display_name: string;
  // default = false (means the factor is not the primary authentication method for the user)
  is_primary: boolean;
  // default = true (means the factor is enabled and can be used for authentication)
  is_enabled: boolean;
  // Not null, using the JSONB data type to store provider-specific configuration and metadata for the authentication factor
  metadata: Record<string, any>;
  // default = null (means the factor is not verified yet)
  verified_at: Date | null;
  // default = null (means the factor has not been used yet)
  last_used_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
};

export type UserProfile = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Default = null
  bio: string | null;
  // Default = null
  avatar_url: string | null;
  // Default = null
  first_name: string | null;
  // Default = null
  last_name: string | null;
  // Default = null
  phone_number: string | null;
  // Default = null
  date_of_birth: Date | null;
  // Default = null
  location: string | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type UserToken = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Not null
  token_hash: string;
  // Not null
  type: UserTokenType;
  // Not null, default = Now() + X day (means the token expires in X days, where X depends on the type of the token)
  expires_at: Date;
  // default = null (means the token has not been used yet)
  used_at: Date | null;
  // default = null (means the token has not been revoked)
  revoked_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type Tenant = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Unique, not null
  name: string;
  // Default = null
  slogan: string | null;
  // Default = null
  avatar_url: string | null;
  // Not null, default = TenantStatusType.ACTIVE
  status: TenantStatusType;
  // Not null
  created_at: Date;
  // Not null
  updated_at: Date;
  // Default = null (means the tenant has not been deleted)
  deleted_at: Date | null;
};

export type TenantSettings = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Default = null
  bio: string | null;
  // Default = null, follows the IANA Time Zone Database format ("America/New_York", "Asia/Shanghai", etc).
  timezone: string | null;
  // Default = null, follows the IETF BCP 47 language tag format ("en-US", "zh-CN", etc).
  locale: string | null;
  // Default = null, follows the Unicode Technical Standard #35 date format pattern ("yyyy-MM-dd", "MM/dd/yyyy", etc).
  date_format: string | null;
  // Not null, default = false (means the tenant does not require email verification for new users)
  require_email_verification: boolean;
  // Not null, default = false (means the tenant does not require multi-factor authentication for user login)
  require_mfa: boolean;
  // Not null, default = false (means the tenant does not allow users to sign up by themselves)
  allow_self_signup: boolean;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantInvitation = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null
  sender_membership_id: string;
  // Not null
  recipient_email: string;
  // Not null
  token_hash: string;
  // Not null, default = Now() + 7 days (means the invitation expires in 7 days)
  expires_at: Date;
  // default = null (means the invitation has not been accepted)
  accepted_at: Date | null;
  // default = null (means the invitation has not been accepted or revoked)
  revoked_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantInvitationsRoleAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantInvitations.id, UUID-typed, not null
  invitation_id: string;
  // Foreign key, references TenantMembershipRole.id, UUID-typed, not null, only for matching tenant roles
  role_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantMembership = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Foreign key, references User.id, UUID-typed, not null
  user_id: string;
  // Not null, default = TenantMembershipStatusType.ACTIVE
  status: TenantMembershipStatusType;
  // Not null, default = current timestamp
  created_at: Date;
  // default = null (means the user has not joined the tenant yet, which is for pending invitations)
  joined_at: Date | null;
  // default = null (means the membership has not been removed)
  removed_at: Date | null;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantMembershipRoleAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null
  membership_id: string;
  // Foreign key, references TenantMembershipRole.id, UUID-typed, not null
  role_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantCustomer = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Not null
  code: string;
  // Not null
  name: string;
  // Not null, default = TenantCustomerStatusType.ACTIVE
  status: TenantCustomerStatusType;
  // Default = null
  website: string | null;
  // Default = null
  industry: string | null;
  // Default = null
  company_size: string | null;
  // Default = null
  country: string | null;
  // Default = null
  address: string | null;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the account manager of the customer
  account_manager_membership_id: string;
  // Not null, Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the user who created the customer
  created_by_membership_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
  // Default = null (means the customer has not been deleted)
  deleted_at: Date | null;
};

export type TenantCustomerContact = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantCustomer.id, UUID-typed, not null
  customer_id: string;
  // Not null
  full_name: string;
  // Default = null
  email: string | null;
  // Default = null
  phone: string | null;
  // Default = null
  job_title: string | null;
  // Default = false (means the contact is not the primary contact for the customer)
  is_primary: boolean;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantCustomerTag = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Not null
  name: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantCustomerTagAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantCustomer.id, UUID-typed, not null
  customer_id: string;
  // Foreign key, references TenantCustomerTag.id, UUID-typed, not null
  tag_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantCustomerNote = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantCustomer.id, UUID-typed, not null
  customer_id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the author of the note
  author_membership_id: string;
  // Not null
  content: string;
  // Default = null (means the note has not been edited yet).  Do not mis-use it with updated_at, which can track internal updates as well.
  edited_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProject = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Foreign key, references TenantCustomer.id, UUID-typed, not null
  customer_id: string | null;
  // Not null
  name: string;
  // Not null
  code: string;
  // Default = null
  description: string | null;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the project owner
  owner_membership_id: string | null;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the user who created the project
  created_by_membership_id: string;
  // Not null, default = TenantProjectStatusType.ACTIVE
  status: TenantProjectStatusType;
  // Default = null
  start_date: Date | null;
  // Default = null
  end_date: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
  // Default = null (means the project has not been deleted)
  completed_at: Date | null;
  // Default = null (means the project has not been archived)
  archived_at: Date | null;
};

export type TenantProjectTeamMember = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjects.id, UUID-typed, not null
  project_id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the team member
  membership_id: string;
  // Foreign key, references TenantMembershipRole.id, UUID-typed, not null,
  // only for matching project roles, indicates the role of the team member in the project
  project_role_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProjectEpic = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjects.id, UUID-typed, not null
  project_id: string;
  // Not null
  code: string;
  // Not null
  title: string;
  // Not null
  description: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the epic owner
  owner_membership_id: string | null;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the user who created the epic
  created_by_membership_id: string;
  // Not null, default = current timestamp
  start_date: Date | null;
  // Not null
  end_date: Date | null;
  // Not null
  updated_at: Date;
  // Default = null (means the epic has not been completed yet)
  completed_at: Date | null;
  // Default = null (means the epic has not been archived yet)
  archived_at: Date | null;
};

export type TenantProjectTask = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjects.id, UUID-typed, not null
  project_id: string;
  // For sub-tasks, default = null (means it's a top-level task)
  parent_task_id: string | null;
  // Foreign key, references TenantProjectEpic.id, UUID-typed, default = null (means the task is not associated with any epic)
  epic_id: string | null;
  // Not null
  title: string;
  // Not null
  description: string;
  // Not null, default = TenantProjectTaskPriorityType.MEDIUM
  priority: TenantProjectTaskPriorityType;
  // Not null, default = TenantProjectTaskStatusType.ACTIVE
  status: TenantProjectTaskStatusType;
  // Default = null
  start_date: Date | null;
  // Default = null
  due_date: Date | null;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the assignee of the task
  created_by_membership_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
  // Default = null (means the task has not been completed yet)
  completed_at: Date | null;
  // Default = null (means the task has not been deleted yet)
  deleted_at: Date | null;
};

export type TenantProjectTaskAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjectTask.id, UUID-typed, not null
  task_id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the assignee of the task
  membership_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProjectTaskComment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjectTask.id, UUID-typed, not null
  task_id: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the author of the comment
  author_membership_id: string;
  // Not null
  content: string;
  // Default = null (means the comment has not been edited yet).  Do not mis-use it with updated_at, which can track internal updates as well.
  edited_at: Date | null;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProjectTaskLabel = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references Tenant.id, UUID-typed, not null
  tenant_id: string;
  // Not null
  name: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProjectTaskLabelAssignment = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjectTaskLabel.id, UUID-typed, not null
  label_id: string;
  // Foreign key, references TenantProjectTask.id, UUID-typed, not null
  task_id: string;
  // Not null, default = current timestamp
  created_at: Date;
  // Not null, default = current timestamp
  updated_at: Date;
};

export type TenantProjectTaskStatusHistory = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjectTask.id, UUID-typed, not null
  task_id: string;
  // Not null
  old_status: TenantProjectTaskStatusType;
  // Not null
  new_status: TenantProjectTaskStatusType;
  // Not null, default = current timestamp
  created_at: Date;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the user who changed the status
  changed_by_membership_id: string;
};

export type TenantProjectTaskActivity = {
  // Primary key, unique, not null, UUID-typed
  id: string;
  // Foreign key, references TenantProjectTask.id, UUID-typed, not null
  task_id: string;
  // Not null
  action: string;
  // Foreign key, references TenantMembership.id, UUID-typed, not null, indicates the tenant membership of the user who performed the action
  actor_membership_id: string;
  // Not null, using the JSONB data type to store additional details and context about the activity
  metadata: Record<string, any>;
  // Not null, default = current timestamp
  created_at: Date;
};

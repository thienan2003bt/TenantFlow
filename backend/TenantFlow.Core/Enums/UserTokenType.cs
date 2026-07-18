namespace TenantFlow.Core.Enums
{
  /// <summary>
  /// UserTokenType Enum: defines the types of verification tokens that can be used for various user verification processes in a system.
  /// Each type represents a different purpose for which the token is generated.
  /// ---
  /// EmailVerification: A token used for verifying a user's email address,
  ///   typically sent as part of the account registration or email change process.
  /// PasswordReset: A token used for resetting a user's password, typically sent when a user requests a password reset.
  /// MFAEnrollment: A token used for enrolling a user in multi-factor authentication (MFA), typically sent during the MFA setup process.
  /// MFAChallenge: A token used for challenging a user during the MFA authentication process,
  ///   typically generated when a user attempts to log in and is required to provide an additional authentication factor.
  /// </summary>
    public enum UserTokenType
    {
      EmailVerification,
      PasswordReset,
      MFAEnrollment,
      MFAChallenge
    }
}
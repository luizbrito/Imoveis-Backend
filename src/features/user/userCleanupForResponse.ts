import { UserWithMembers } from './userSchemas';

export function userCleanupForResponse(user: UserWithMembers) {
  const userWithoutPassword = {
    ...user,
    password: undefined,
    passwordResetToken: undefined,
    passwordResetTokenExpiresAt: undefined,
    verifyEmailToken: undefined,
    verifyEmailTokenExpiresAt: undefined,
  };

  return userWithoutPassword;
}

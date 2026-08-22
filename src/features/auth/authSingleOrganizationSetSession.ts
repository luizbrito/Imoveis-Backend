import { PrismaClient } from '../../prisma/generated/client';

/**
 * Auto-selects organization when user has exactly one membership
 * Works in both single and multi-tenant modes
 * Runs BEFORE session creation to set activeOrganizationId on the session
 * Returns the organizationId and memberId to set, or null if none/multiple found
 */
export async function authAutoSelectOrganization(params: {
  userId: string;
  prisma: PrismaClient;
}): Promise<{
  organizationId: string;
  memberId: string;
} | null> {
  const { userId, prisma } = params;

  try {
    // Get all non-disabled memberships for the user
    const members = await prisma.member.findMany({
      where: { userId, disabled: false },
      select: { organizationId: true, id: true },
    });

    // Only auto-select if user has exactly one non-disabled membership
    if (members.length === 1) {
      return {
        organizationId: members[0].organizationId,
        memberId: members[0].id,
      };
    }

    // If user has no memberships or multiple memberships, don't auto-select
    // Invitation auto-accept is handled on the frontend NoPermissionsPage
    // since it needs proper session context for Better Auth API calls
    return null;
  } catch (error) {
    console.error(
      'Failed to auto-select organization for user:',
      userId,
      error,
    );
    return null;
  }
}

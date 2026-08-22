import type { AppContext } from '../../shared/controller/appContext';
import { Error400 } from '../../shared/errors/Error400';
import type { Member } from '../../prisma/generated/client';
import { SubscriptionMode } from '../../prisma/generated/client';
import { prisma } from '../../prisma';
import { rolesIds } from '../permissions';
import { subscriptionStatuses } from '../subscription/subscriptionStatuses';
import { env } from '../../env';

/**
 * Checks if an admin member can be deleted or have their admin role removed.
 * Prevents the action if:
 * 1. SUBSCRIPTION_MODE is 'organization'
 * 2. The member is an admin
 * 3. The organization has an active subscription
 *
 * @throws Error with code 'CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION' if the admin cannot be removed
 */
export async function memberCanRemoveAdmin(
  member: Pick<Member, 'role' | 'id'>,
  organizationId: string,
  currentMemberId?: string,
): Promise<void> {
  // Prevent removing self
  if (currentMemberId && member.id === currentMemberId) {
    const error = new Error('CANNOT_REMOVE_SELF');
    error.name = 'CANNOT_REMOVE_SELF';
    throw error;
  }

  // Only check if the member is an admin
  if (member.role !== rolesIds.admin) {
    return;
  }

  // Only check if subscription mode is 'organization'
  const subscriptionMode = env.SUBSCRIPTION_MODE;

  if (subscriptionMode !== 'organization') {
    return;
  }

  // Check if organization has an active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      organizationId,
      mode: SubscriptionMode.organization,
      status: { in: subscriptionStatuses.active },
    },
  });

  if (activeSubscription) {
    const error = new Error('CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION');
    error.name = 'CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION';
    throw error;
  }
}

/**
 * Convenience wrapper for use in controllers where AppContext is available
 * Converts the error to Error400 with proper i18n message
 */
export async function memberCanRemoveAdminWithContext(
  member: Member,
  context: AppContext,
): Promise<void> {
  if (!context.currentOrganization?.id) {
    return;
  }

  try {
    await memberCanRemoveAdmin(
      member,
      context.currentOrganization.id,
      context.currentMember?.id,
    );
  } catch (error: any) {
    if (error.name === 'CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION') {
      throw new Error400(
        context.dictionary.auth.errors.CANNOT_REMOVE_ADMIN_WITH_SUBSCRIPTION,
      );
    }
    if (error.name === 'CANNOT_REMOVE_SELF') {
      throw new Error400(context.dictionary.member.errors.cannotRemoveSelf);
    }
    throw error;
  }
}

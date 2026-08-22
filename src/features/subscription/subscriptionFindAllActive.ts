import { subscriptionSelectAndValidateDefaultMode } from './subscriptionSelectAndValidateDefaultMode';
import { subscriptionStatuses } from './subscriptionStatuses';
import { prisma } from '../../prisma';
import { AppContext } from '../../shared/controller/appContext';
import { UserWithMembers } from '../user/userSchemas';

export async function subscriptionFindAllActive(
  userWithMembers: UserWithMembers,
  context: AppContext,
) {
  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  const organizationIds =
    userWithMembers.members?.map((m) => m.organizationId) || [];

  if (organizationIds.length === 0) {
    return [];
  }

  let whereClause: any = {
    status: { in: subscriptionStatuses.active },
    mode: subscriptionMode,
  };

  if (subscriptionMode === 'organization') {
    whereClause.organizationId = { in: organizationIds };
  } else if (subscriptionMode === 'member') {
    const memberIds = userWithMembers.members?.map((m) => m.id) || [];
    whereClause.memberId = { in: memberIds };
  }

  const subscriptions = await prisma.subscription.findMany({
    where: whereClause,
  });

  return subscriptions;
}

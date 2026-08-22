import { prisma } from '../../prisma';
import { AppContext } from '../../shared/controller/appContext';
import { subscriptionSelectAndValidateDefaultMode } from './subscriptionSelectAndValidateDefaultMode';
import { subscriptionStatuses } from './subscriptionStatuses';

export async function subscriptionFindActive(context: AppContext) {
  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  let criteriaAnd = [];

  criteriaAnd.push({ status: { in: subscriptionStatuses.active } });
  criteriaAnd.push({ mode: subscriptionMode });

  if (subscriptionMode === 'organization') {
    criteriaAnd.push({
      organizationId: context.currentOrganization?.id,
    });
  }

  if (subscriptionMode === 'member') {
    criteriaAnd.push({
      userId: context.currentUser?.id,
      organizationId: context.currentOrganization?.id,
      memberId: context.currentMember?.id,
    });
  }

  return await prisma.subscription.findFirst({
    where: {
      AND: criteriaAnd,
    },
  });
}

import { z } from 'zod';
import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';

export const notificationUnreadCountApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/notification/unread-count',
  response: 'number',
};

export async function notificationUnreadCountController(context: AppContext) {
  const { currentUser, currentOrganization } = await authGuardBackend(
    {
      notification: ['read'],
    },
    context,
  );

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const count = await tx.notification.count({
        where: {
          userId: currentUser.id,
          organizationId: currentOrganization.id,
          readAt: null,
        },
      });

      return { count };
    },
  );
}

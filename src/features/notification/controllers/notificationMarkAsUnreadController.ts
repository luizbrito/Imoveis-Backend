import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { notificationMarkAsUnreadSchema } from '../notificationSchemas';

export const notificationMarkAsUnreadApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/notification/mark-as-unread',
  body: notificationMarkAsUnreadSchema,
  response: 'boolean',
};

export async function notificationMarkAsUnreadController(
  body: unknown,
  context: AppContext,
) {
  const { currentUser, currentOrganization } = await authGuardBackend(
    {
      notification: ['read'],
    },
    context,
  );

  const data = notificationMarkAsUnreadSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const where: any = {
        userId: currentUser.id,
        organizationId: currentOrganization.id,
        readAt: { not: null }, // Only mark read notifications
      };

      if (data.ids && data.ids.length > 0) {
        where.id = { in: data.ids };
      }

      const result = await tx.notification.updateMany({
        where,
        data: {
          readAt: null,
        },
      });

      return {
        success: true,
        count: result.count,
      };
    },
  );
}

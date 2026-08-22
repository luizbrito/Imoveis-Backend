import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { notificationMarkAsReadSchema } from '../notificationSchemas';

export const notificationMarkAsReadApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/notification/mark-as-read',
  body: notificationMarkAsReadSchema,
  response: 'boolean',
};

export async function notificationMarkAsReadController(
  body: unknown,
  context: AppContext,
) {
  const { currentUser, currentOrganization } = await authGuardBackend(
    {
      notification: ['read'],
    },
    context,
  );

  const data = notificationMarkAsReadSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const where: any = {
        userId: currentUser.id,
        organizationId: currentOrganization.id,
        readAt: null, // Only mark unread notifications
      };

      if (data.ids && data.ids.length > 0) {
        where.id = { in: data.ids };
      }

      const result = await tx.notification.updateMany({
        where,
        data: {
          readAt: new Date(),
        },
      });

      return {
        success: true,
        count: result.count,
      };
    },
  );
}

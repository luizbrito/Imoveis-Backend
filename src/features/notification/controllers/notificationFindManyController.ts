import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { notificationFindManyInputSchema } from '../notificationSchemas';
import { Notification } from '@project/backend/prisma/prismaTypes';

export const notificationFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/notification',
  query: notificationFindManyInputSchema,
  response: 'Notification[]',
};

export async function notificationFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentUser, currentOrganization } = await authGuardBackend(
    {
      notification: ['read'],
    },
    context,
  );

  const validatedQuery = notificationFindManyInputSchema.parse(query);
  const {
    filter = {},
    orderBy = { createdAt: 'desc' },
    offset,
    limit,
  } = validatedQuery;

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const where: any = {
        userId: currentUser.id,
        organizationId: currentOrganization.id,
      };

      if (filter.type) {
        where.type = filter.type;
      }

      if (filter.read !== undefined) {
        if (filter.read === 'true') {
          where.readAt = { not: null };
        } else if (filter.read === 'false') {
          where.readAt = null;
        }
      }

      const [rows, count] = await Promise.all([
        tx.notification.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
        tx.notification.count({ where }),
      ]);

      return {
        rows: rows as Notification[],
        count,
      };
    },
  );
}

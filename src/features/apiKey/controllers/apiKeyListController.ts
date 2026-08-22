import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { prisma } from '../../../prisma';
import { apiKeyFindManyInputSchema } from '../apiKeySchemas';

export const apiKeyListApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/api-key',
  response: '{ apiKeys: ApiKey[], count: number }',
};

export async function apiKeyListController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      apiKey: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    apiKeyFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx: any) => {
      const where = {
        organizationId: currentOrganization.id,
        referenceId: context.currentUser?.id,
        ...(filter?.name
          ? { name: { contains: filter.name, mode: 'insensitive' as const } }
          : {}),
      };

      const [apiKeys, count] = await Promise.all([
        tx.apiKey.findMany({
          where,
          select: {
            id: true,
            name: true,
            start: true,
            referenceId: true,
            prefix: true,
            refillInterval: true,
            refillAmount: true,
            lastRefillAt: true,
            enabled: true,
            rateLimitEnabled: true,
            rateLimitTimeWindow: true,
            rateLimitMax: true,
            remaining: true,
            lastRequest: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            permissions: true,
            metadata: true,
          },
          skip,
          take,
          orderBy,
        }),
        tx.apiKey.count({ where }),
      ]);

      return { apiKeys, count };
    },
  );
}

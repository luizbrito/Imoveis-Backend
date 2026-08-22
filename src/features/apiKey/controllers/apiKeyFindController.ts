import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { Error404 } from '../../../shared/errors/Error404';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { apiKeyFindSchema } from '../apiKeySchemas';

export const apiKeyFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/api-key/{id}',
  params: apiKeyFindSchema,
  response: 'ApiKey',
};

export async function apiKeyFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      apiKey: ['read'],
    },
    context,
  );

  const { id } = apiKeyFindSchema.parse(params);

  const apiKey = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      return await tx.apiKey.findFirst({
        where: {
          id,
          organizationId: currentOrganization.id,
          referenceId: context.currentUser?.id,
        },
        select: {
          id: true,
          name: true,
          enabled: true,
        },
      });
    },
  );

  if (!apiKey) {
    throw new Error404();
  }

  return apiKey;
}

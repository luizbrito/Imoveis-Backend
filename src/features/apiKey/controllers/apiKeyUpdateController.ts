import { prisma } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { Error404 } from '../../../shared/errors/Error404';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { apiKeyUpdateBodySchema } from '../apiKeySchemas';

export const apiKeyUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/api-key/:id',
  body: apiKeyUpdateBodySchema,
};

export async function apiKeyUpdateController(
  id: string,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      apiKey: ['update'],
    },
    context,
  );
  return await apiKeyUpdate(id, body, context, currentOrganization);
}

export async function apiKeyUpdate(
  id: string,
  body: unknown,
  context: AppContext,
  currentOrganization: { id: string },
) {
  const data = apiKeyUpdateBodySchema.parse(body);

  const existingApiKey = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      return await tx.apiKey.findFirst({
        where: {
          id,
          organizationId: currentOrganization.id,
          referenceId: context.currentUser?.id,
        },
      });
    },
  );

  if (!existingApiKey) {
    throw new Error404();
  }

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const updatedApiKey = await tx.apiKey.update({
        where: { id },
        data: {
          name: data.name,
          enabled: data.enabled,
          updatedAt: new Date(),
        },
      });

      await auditLogCreate({
        entityId: updatedApiKey.id,
        entityName: 'ApiKey',
        operation: auditLogOperations.update,
        context,
        oldData: {
          id: existingApiKey.id,
          name: existingApiKey.name,
          enabled: existingApiKey.enabled,
        },
        newData: {
          id: updatedApiKey.id,
          name: updatedApiKey.name,
          enabled: updatedApiKey.enabled,
        },
        tx,
      });

      return updatedApiKey;
    },
  );
}

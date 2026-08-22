import { APIError } from 'better-auth';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { Error404 } from '../../../shared/errors/Error404';
import { prisma } from '../../../prisma';

export const apiKeyDeleteApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/api-key/:id',
};

export async function apiKeyDeleteController(id: string, context: AppContext) {
  const { currentOrganization } = await authGuardBackend(
    {
      apiKey: ['delete'],
    },
    context,
  );
  return await apiKeyDelete(id, context, currentOrganization);
}

export async function apiKeyDelete(
  id: string,
  context: AppContext,
  currentOrganization: { id: string },
) {
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

  try {
    await authBackend.api.deleteApiKey({
      body: {
        keyId: id,
      },
      headers: context.headers,
    });

    await auditLogCreate({
      entityId: existingApiKey.id,
      entityName: 'ApiKey',
      operation: auditLogOperations.delete,
      context,
      oldData: {
        id: existingApiKey.id,
        name: existingApiKey.name,
        enabled: existingApiKey.enabled,
      },
      newData: null,
    });

    return existingApiKey;
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error400(
        dictionaryEnumerator(
          context.dictionary.auth.errors,
          error.body?.code,
        ) ||
          error?.body?.message ||
          context.dictionary.shared.errors.unknown,
      );
    }

    throw error;
  }
}

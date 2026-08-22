import { Context } from 'hono';
import { auditLogOperations } from './auditLogOperations';
import { prisma } from '../../prisma';
import { AppContext } from '../../shared/controller/appContext';

export async function auditLogApiKeyCall(
  c: Context,
  context: AppContext,
  apiHttpResponseCode: number,
) {
  if (!context.apiKey?.id || !context.currentOrganization) {
    return;
  }

  const request = c.req;
  const method = request.method;

  const methodOperations = {
    POST: auditLogOperations.apiPost,
    PUT: auditLogOperations.apiPut,
    DELETE: auditLogOperations.apiDelete,
    GET: auditLogOperations.apiGet,
  };

  const operation = methodOperations[method as keyof typeof methodOperations];

  if (!operation) {
    // Happens for OPTIONS requests, which are not logged
    return;
  }

  const apiKeyId = context.apiKey.id;

  await prisma.$withRLS(
    { organization: context.currentOrganization },
    async (tx) => {
      await tx.auditLog.create({
        data: {
          entityId: apiKeyId,
          userId: context.currentUser?.id ?? null,
          organizationId: context.currentOrganization?.id ?? null,
          memberId: context.currentMember?.id ?? null,
          apiKeyId,
          entityName: 'ApiKey',
          operation,
          timestamp: new Date(),
          apiHttpResponseCode: apiHttpResponseCode.toString(),
          apiEndpoint: request.path,
        },
      });
    },
  );
}

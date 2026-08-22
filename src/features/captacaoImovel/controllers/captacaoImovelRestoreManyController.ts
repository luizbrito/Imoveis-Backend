import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { captacaoImovelRestoreManyInputSchema } from '../captacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/captacao-imovel/restore',
  query: captacaoImovelRestoreManyInputSchema,
};

export const captacaoImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacao-imovel_restore_many',
  description: dictionary.captacaoImovel.mcpDescription.restore,
  requiredPermissions: { captacaoImovel: ['restore'] },
  schema: toMcpJsonSchema(captacaoImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelRestoreManyController(params, context);
  },
});

export async function captacaoImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['restore'],
    },
    context,
  );

  const { ids } = captacaoImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCaptacoesImovel = await tx.captacaoImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.captacaoImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCaptacoesImovel = await tx.captacaoImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldCaptacaoImovel of oldCaptacoesImovel) {
        const newCaptacaoImovel = newCaptacoesImovel.find(
          (c) => c.id === oldCaptacaoImovel.id,
        );
        await auditLogCreate({
          entityId: oldCaptacaoImovel.id,
          entityName: 'CaptacaoImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldCaptacaoImovel,
          newData: newCaptacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}

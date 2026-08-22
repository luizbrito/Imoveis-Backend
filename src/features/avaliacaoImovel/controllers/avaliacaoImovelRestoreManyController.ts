import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { avaliacaoImovelRestoreManyInputSchema } from '../avaliacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/avaliacao-imovel/restore',
  query: avaliacaoImovelRestoreManyInputSchema,
};

export const avaliacaoImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacao-imovel_restore_many',
  description: dictionary.avaliacaoImovel.mcpDescription.restore,
  requiredPermissions: { avaliacaoImovel: ['restore'] },
  schema: toMcpJsonSchema(avaliacaoImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelRestoreManyController(params, context);
  },
});

export async function avaliacaoImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['restore'],
    },
    context,
  );

  const { ids } = avaliacaoImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldAvaliacoesImovel = await tx.avaliacaoImovel.findMany({
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

      const result = await tx.avaliacaoImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newAvaliacoesImovel = await tx.avaliacaoImovel.findMany({
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

      for (const oldAvaliacaoImovel of oldAvaliacoesImovel) {
        const newAvaliacaoImovel = newAvaliacoesImovel.find(
          (c) => c.id === oldAvaliacaoImovel.id,
        );
        await auditLogCreate({
          entityId: oldAvaliacaoImovel.id,
          entityName: 'AvaliacaoImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldAvaliacaoImovel,
          newData: newAvaliacaoImovel,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { despesaImovelRestoreManyInputSchema } from '../despesaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/despesa-imovel/restore',
  query: despesaImovelRestoreManyInputSchema,
};

export const despesaImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesa-imovel_restore_many',
  description: dictionary.despesaImovel.mcpDescription.restore,
  requiredPermissions: { despesaImovel: ['restore'] },
  schema: toMcpJsonSchema(despesaImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await despesaImovelRestoreManyController(params, context);
  },
});

export async function despesaImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['restore'],
    },
    context,
  );

  const { ids } = despesaImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDespesasImovel = await tx.despesaImovel.findMany({
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

      const result = await tx.despesaImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDespesasImovel = await tx.despesaImovel.findMany({
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

      for (const oldDespesaImovel of oldDespesasImovel) {
        const newDespesaImovel = newDespesasImovel.find(
          (c) => c.id === oldDespesaImovel.id,
        );
        await auditLogCreate({
          entityId: oldDespesaImovel.id,
          entityName: 'DespesaImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldDespesaImovel,
          newData: newDespesaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { despesaImovelArchiveManyInputSchema as despesaImovelArchiveManyInputSchema } from '../despesaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/despesa-imovel/archive',
  query: despesaImovelArchiveManyInputSchema,
};

export const despesaImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesa-imovel_archive_many',
  description: dictionary.despesaImovel.mcpDescription.archive,
  requiredPermissions: { despesaImovel: ['archive'] },
  schema: toMcpJsonSchema(despesaImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await despesaImovelArchiveManyController(params, context);
  },
});

export async function despesaImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['archive'],
    },
    context,
  );

  const { ids } = despesaImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

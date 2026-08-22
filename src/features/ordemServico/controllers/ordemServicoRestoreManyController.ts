import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ordemServicoRestoreManyInputSchema } from '../ordemServicoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ordem-servico/restore',
  query: ordemServicoRestoreManyInputSchema,
};

export const ordemServicoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordem-servico_restore_many',
  description: dictionary.ordemServico.mcpDescription.restore,
  requiredPermissions: { ordemServico: ['restore'] },
  schema: toMcpJsonSchema(ordemServicoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await ordemServicoRestoreManyController(params, context);
  },
});

export async function ordemServicoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['restore'],
    },
    context,
  );

  const { ids } = ordemServicoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldOrdensServico = await tx.ordemServico.findMany({
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

      const result = await tx.ordemServico.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newOrdensServico = await tx.ordemServico.findMany({
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

      for (const oldOrdemServico of oldOrdensServico) {
        const newOrdemServico = newOrdensServico.find(
          (c) => c.id === oldOrdemServico.id,
        );
        await auditLogCreate({
          entityId: oldOrdemServico.id,
          entityName: 'OrdemServico',
          operation: auditLogOperations.update,
          context,
          oldData: oldOrdemServico,
          newData: newOrdemServico,
          tx,
        });
      }

      return result;
    },
  );
}

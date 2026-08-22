import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ordemServicoArchiveManyInputSchema as ordemServicoArchiveManyInputSchema } from '../ordemServicoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ordem-servico/archive',
  query: ordemServicoArchiveManyInputSchema,
};

export const ordemServicoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordem-servico_archive_many',
  description: dictionary.ordemServico.mcpDescription.archive,
  requiredPermissions: { ordemServico: ['archive'] },
  schema: toMcpJsonSchema(ordemServicoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await ordemServicoArchiveManyController(params, context);
  },
});

export async function ordemServicoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['archive'],
    },
    context,
  );

  const { ids } = ordemServicoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { simulacaoFinanciamentoArchiveManyInputSchema as simulacaoFinanciamentoArchiveManyInputSchema } from '../simulacaoFinanciamentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/simulacao-financiamento/archive',
  query: simulacaoFinanciamentoArchiveManyInputSchema,
};

export const simulacaoFinanciamentoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacao-financiamento_archive_many',
  description: dictionary.simulacaoFinanciamento.mcpDescription.archive,
  requiredPermissions: { simulacaoFinanciamento: ['archive'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoArchiveManyController(params, context);
  },
});

export async function simulacaoFinanciamentoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['archive'],
    },
    context,
  );

  const { ids } = simulacaoFinanciamentoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSimulacoesFinanciamento =
        await tx.simulacaoFinanciamento.findMany({
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

      const result = await tx.simulacaoFinanciamento.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newSimulacoesFinanciamento =
        await tx.simulacaoFinanciamento.findMany({
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

      for (const oldSimulacaoFinanciamento of oldSimulacoesFinanciamento) {
        const newSimulacaoFinanciamento = newSimulacoesFinanciamento.find(
          (c) => c.id === oldSimulacaoFinanciamento.id,
        );
        await auditLogCreate({
          entityId: oldSimulacaoFinanciamento.id,
          entityName: 'SimulacaoFinanciamento',
          operation: auditLogOperations.update,
          context,
          oldData: oldSimulacaoFinanciamento,
          newData: newSimulacaoFinanciamento,
          tx,
        });
      }

      return result;
    },
  );
}

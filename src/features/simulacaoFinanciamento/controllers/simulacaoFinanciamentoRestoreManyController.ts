import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { simulacaoFinanciamentoRestoreManyInputSchema } from '../simulacaoFinanciamentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/simulacao-financiamento/restore',
  query: simulacaoFinanciamentoRestoreManyInputSchema,
};

export const simulacaoFinanciamentoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacao-financiamento_restore_many',
  description: dictionary.simulacaoFinanciamento.mcpDescription.restore,
  requiredPermissions: { simulacaoFinanciamento: ['restore'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoRestoreManyController(params, context);
  },
});

export async function simulacaoFinanciamentoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['restore'],
    },
    context,
  );

  const { ids } = simulacaoFinanciamentoRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

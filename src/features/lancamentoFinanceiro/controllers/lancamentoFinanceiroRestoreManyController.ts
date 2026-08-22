import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { lancamentoFinanceiroRestoreManyInputSchema } from '../lancamentoFinanceiroSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lancamento-financeiro/restore',
  query: lancamentoFinanceiroRestoreManyInputSchema,
};

export const lancamentoFinanceiroRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamento-financeiro_restore_many',
  description: dictionary.lancamentoFinanceiro.mcpDescription.restore,
  requiredPermissions: { lancamentoFinanceiro: ['restore'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroRestoreManyInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroRestoreManyController(params, context);
  },
});

export async function lancamentoFinanceiroRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['restore'],
    },
    context,
  );

  const { ids } = lancamentoFinanceiroRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldLancamentosFinanceiros = await tx.lancamentoFinanceiro.findMany({
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

      const result = await tx.lancamentoFinanceiro.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newLancamentosFinanceiros = await tx.lancamentoFinanceiro.findMany({
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

      for (const oldLancamentoFinanceiro of oldLancamentosFinanceiros) {
        const newLancamentoFinanceiro = newLancamentosFinanceiros.find(
          (c) => c.id === oldLancamentoFinanceiro.id,
        );
        await auditLogCreate({
          entityId: oldLancamentoFinanceiro.id,
          entityName: 'LancamentoFinanceiro',
          operation: auditLogOperations.update,
          context,
          oldData: oldLancamentoFinanceiro,
          newData: newLancamentoFinanceiro,
          tx,
        });
      }

      return result;
    },
  );
}

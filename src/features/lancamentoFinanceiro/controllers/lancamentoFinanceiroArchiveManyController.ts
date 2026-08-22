import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { lancamentoFinanceiroArchiveManyInputSchema as lancamentoFinanceiroArchiveManyInputSchema } from '../lancamentoFinanceiroSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lancamento-financeiro/archive',
  query: lancamentoFinanceiroArchiveManyInputSchema,
};

export const lancamentoFinanceiroArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamento-financeiro_archive_many',
  description: dictionary.lancamentoFinanceiro.mcpDescription.archive,
  requiredPermissions: { lancamentoFinanceiro: ['archive'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroArchiveManyInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroArchiveManyController(params, context);
  },
});

export async function lancamentoFinanceiroArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['archive'],
    },
    context,
  );

  const { ids } = lancamentoFinanceiroArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

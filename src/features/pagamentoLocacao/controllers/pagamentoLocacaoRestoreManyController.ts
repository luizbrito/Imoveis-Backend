import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoLocacaoRestoreManyInputSchema } from '../pagamentoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-locacao/restore',
  query: pagamentoLocacaoRestoreManyInputSchema,
};

export const pagamentoLocacaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamento-locacao_restore_many',
  description: dictionary.pagamentoLocacao.mcpDescription.restore,
  requiredPermissions: { pagamentoLocacao: ['restore'] },
  schema: toMcpJsonSchema(pagamentoLocacaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoRestoreManyController(params, context);
  },
});

export async function pagamentoLocacaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['restore'],
    },
    context,
  );

  const { ids } = pagamentoLocacaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPagamentosLocacao = await tx.pagamentoLocacao.findMany({
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

      const result = await tx.pagamentoLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newPagamentosLocacao = await tx.pagamentoLocacao.findMany({
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

      for (const oldPagamentoLocacao of oldPagamentosLocacao) {
        const newPagamentoLocacao = newPagamentosLocacao.find(
          (c) => c.id === oldPagamentoLocacao.id,
        );
        await auditLogCreate({
          entityId: oldPagamentoLocacao.id,
          entityName: 'PagamentoLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldPagamentoLocacao,
          newData: newPagamentoLocacao,
          tx,
        });
      }

      return result;
    },
  );
}

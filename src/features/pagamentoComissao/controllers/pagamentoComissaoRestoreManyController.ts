import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoComissaoRestoreManyInputSchema } from '../pagamentoComissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-comissao/restore',
  query: pagamentoComissaoRestoreManyInputSchema,
};

export const pagamentoComissaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamento-comissao_restore_many',
  description: dictionary.pagamentoComissao.mcpDescription.restore,
  requiredPermissions: { pagamentoComissao: ['restore'] },
  schema: toMcpJsonSchema(pagamentoComissaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoRestoreManyController(params, context);
  },
});

export async function pagamentoComissaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['restore'],
    },
    context,
  );

  const { ids } = pagamentoComissaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldPagamentosComissao = await tx.pagamentoComissao.findMany({
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

      const result = await tx.pagamentoComissao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newPagamentosComissao = await tx.pagamentoComissao.findMany({
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

      for (const oldPagamentoComissao of oldPagamentosComissao) {
        const newPagamentoComissao = newPagamentosComissao.find(
          (c) => c.id === oldPagamentoComissao.id,
        );
        await auditLogCreate({
          entityId: oldPagamentoComissao.id,
          entityName: 'PagamentoComissao',
          operation: auditLogOperations.update,
          context,
          oldData: oldPagamentoComissao,
          newData: newPagamentoComissao,
          tx,
        });
      }

      return result;
    },
  );
}

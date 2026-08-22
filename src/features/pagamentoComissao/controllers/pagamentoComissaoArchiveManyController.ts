import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoComissaoArchiveManyInputSchema as pagamentoComissaoArchiveManyInputSchema } from '../pagamentoComissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-comissao/archive',
  query: pagamentoComissaoArchiveManyInputSchema,
};

export const pagamentoComissaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamento-comissao_archive_many',
  description: dictionary.pagamentoComissao.mcpDescription.archive,
  requiredPermissions: { pagamentoComissao: ['archive'] },
  schema: toMcpJsonSchema(pagamentoComissaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoArchiveManyController(params, context);
  },
});

export async function pagamentoComissaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['archive'],
    },
    context,
  );

  const { ids } = pagamentoComissaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

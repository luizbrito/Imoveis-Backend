import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoLocacaoArchiveManyInputSchema as pagamentoLocacaoArchiveManyInputSchema } from '../pagamentoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/pagamento-locacao/archive',
  query: pagamentoLocacaoArchiveManyInputSchema,
};

export const pagamentoLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamento-locacao_archive_many',
  description: dictionary.pagamentoLocacao.mcpDescription.archive,
  requiredPermissions: { pagamentoLocacao: ['archive'] },
  schema: toMcpJsonSchema(pagamentoLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoArchiveManyController(params, context);
  },
});

export async function pagamentoLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['archive'],
    },
    context,
  );

  const { ids } = pagamentoLocacaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

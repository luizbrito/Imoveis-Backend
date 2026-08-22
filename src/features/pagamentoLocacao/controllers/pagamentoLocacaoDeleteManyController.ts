import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoLocacaoDeleteManyInputSchema } from '../pagamentoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/pagamento-locacao',
  query: pagamentoLocacaoDeleteManyInputSchema,
};

export const pagamentoLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_delete_many',
  description: dictionary.pagamentoLocacao.mcpDescription.delete,
  requiredPermissions: { pagamentoLocacao: ['delete'] },
  schema: toMcpJsonSchema(pagamentoLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoDeleteManyController(params, context);
  },
});

export async function pagamentoLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['delete'],
    },
    context,
  );

  const { ids } = pagamentoLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const pagamentosLocacaoToDelete = await tx.pagamentoLocacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          cobranca: {
            select: {
              id: true,
              competencia: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.pagamentoLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const pagamentoLocacao of pagamentosLocacaoToDelete) {
        await auditLogCreate({
          entityId: pagamentoLocacao.id,
          entityName: 'PagamentoLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: pagamentoLocacao,
          tx,
        });
      }

      return result;
    },
  );
}

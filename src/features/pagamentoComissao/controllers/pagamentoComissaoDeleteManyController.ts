import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoComissaoDeleteManyInputSchema } from '../pagamentoComissaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/pagamento-comissao',
  query: pagamentoComissaoDeleteManyInputSchema,
};

export const pagamentoComissaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_delete_many',
  description: dictionary.pagamentoComissao.mcpDescription.delete,
  requiredPermissions: { pagamentoComissao: ['delete'] },
  schema: toMcpJsonSchema(pagamentoComissaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoDeleteManyController(params, context);
  },
});

export async function pagamentoComissaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['delete'],
    },
    context,
  );

  const { ids } = pagamentoComissaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const pagamentosComissaoToDelete = await tx.pagamentoComissao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          comissao: {
            select: {
              id: true,
              codigo: true,
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

      const result = await tx.pagamentoComissao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const pagamentoComissao of pagamentosComissaoToDelete) {
        await auditLogCreate({
          entityId: pagamentoComissao.id,
          entityName: 'PagamentoComissao',
          operation: auditLogOperations.delete,
          context,
          oldData: pagamentoComissao,
          tx,
        });
      }

      return result;
    },
  );
}

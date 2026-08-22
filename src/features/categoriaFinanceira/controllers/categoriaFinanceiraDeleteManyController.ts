import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { categoriaFinanceiraDeleteManyInputSchema } from '../categoriaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/categoria-financeira',
  query: categoriaFinanceiraDeleteManyInputSchema,
};

export const categoriaFinanceiraDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_delete_many',
  description: dictionary.categoriaFinanceira.mcpDescription.delete,
  requiredPermissions: { categoriaFinanceira: ['delete'] },
  schema: toMcpJsonSchema(categoriaFinanceiraDeleteManyInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraDeleteManyController(params, context);
  },
});

export async function categoriaFinanceiraDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['delete'],
    },
    context,
  );

  const { ids } = categoriaFinanceiraDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const categoriasFinanceirasToDelete =
        await tx.categoriaFinanceira.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            lancamentos: {
              select: {
                id: true,
                descricao: true,
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

      const result = await tx.categoriaFinanceira.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const categoriaFinanceira of categoriasFinanceirasToDelete) {
        await auditLogCreate({
          entityId: categoriaFinanceira.id,
          entityName: 'CategoriaFinanceira',
          operation: auditLogOperations.delete,
          context,
          oldData: categoriaFinanceira,
          tx,
        });
      }

      return result;
    },
  );
}

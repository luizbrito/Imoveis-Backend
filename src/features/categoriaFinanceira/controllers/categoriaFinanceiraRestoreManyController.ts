import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { categoriaFinanceiraRestoreManyInputSchema } from '../categoriaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/categoria-financeira/restore',
  query: categoriaFinanceiraRestoreManyInputSchema,
};

export const categoriaFinanceiraRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoria-financeira_restore_many',
  description: dictionary.categoriaFinanceira.mcpDescription.restore,
  requiredPermissions: { categoriaFinanceira: ['restore'] },
  schema: toMcpJsonSchema(categoriaFinanceiraRestoreManyInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraRestoreManyController(params, context);
  },
});

export async function categoriaFinanceiraRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['restore'],
    },
    context,
  );

  const { ids } = categoriaFinanceiraRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCategoriasFinanceiras = await tx.categoriaFinanceira.findMany({
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

      const result = await tx.categoriaFinanceira.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCategoriasFinanceiras = await tx.categoriaFinanceira.findMany({
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

      for (const oldCategoriaFinanceira of oldCategoriasFinanceiras) {
        const newCategoriaFinanceira = newCategoriasFinanceiras.find(
          (c) => c.id === oldCategoriaFinanceira.id,
        );
        await auditLogCreate({
          entityId: oldCategoriaFinanceira.id,
          entityName: 'CategoriaFinanceira',
          operation: auditLogOperations.update,
          context,
          oldData: oldCategoriaFinanceira,
          newData: newCategoriaFinanceira,
          tx,
        });
      }

      return result;
    },
  );
}

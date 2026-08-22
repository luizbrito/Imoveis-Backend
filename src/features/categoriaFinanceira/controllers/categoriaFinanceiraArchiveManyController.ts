import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { categoriaFinanceiraArchiveManyInputSchema as categoriaFinanceiraArchiveManyInputSchema } from '../categoriaFinanceiraSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/categoria-financeira/archive',
  query: categoriaFinanceiraArchiveManyInputSchema,
};

export const categoriaFinanceiraArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoria-financeira_archive_many',
  description: dictionary.categoriaFinanceira.mcpDescription.archive,
  requiredPermissions: { categoriaFinanceira: ['archive'] },
  schema: toMcpJsonSchema(categoriaFinanceiraArchiveManyInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraArchiveManyController(params, context);
  },
});

export async function categoriaFinanceiraArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['archive'],
    },
    context,
  );

  const { ids } = categoriaFinanceiraArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

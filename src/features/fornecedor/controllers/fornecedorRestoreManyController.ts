import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { fornecedorRestoreManyInputSchema } from '../fornecedorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/fornecedor/restore',
  query: fornecedorRestoreManyInputSchema,
};

export const fornecedorRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'fornecedor_restore_many',
  description: dictionary.fornecedor.mcpDescription.restore,
  requiredPermissions: { fornecedor: ['restore'] },
  schema: toMcpJsonSchema(fornecedorRestoreManyInputSchema),
  handler: async (params, context) => {
    return await fornecedorRestoreManyController(params, context);
  },
});

export async function fornecedorRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['restore'],
    },
    context,
  );

  const { ids } = fornecedorRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldFornecedores = await tx.fornecedor.findMany({
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

      const result = await tx.fornecedor.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newFornecedores = await tx.fornecedor.findMany({
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

      for (const oldFornecedor of oldFornecedores) {
        const newFornecedor = newFornecedores.find(
          (c) => c.id === oldFornecedor.id,
        );
        await auditLogCreate({
          entityId: oldFornecedor.id,
          entityName: 'Fornecedor',
          operation: auditLogOperations.update,
          context,
          oldData: oldFornecedor,
          newData: newFornecedor,
          tx,
        });
      }

      return result;
    },
  );
}

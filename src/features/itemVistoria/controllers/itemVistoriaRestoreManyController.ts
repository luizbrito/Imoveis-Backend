import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { itemVistoriaRestoreManyInputSchema } from '../itemVistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item-vistoria/restore',
  query: itemVistoriaRestoreManyInputSchema,
};

export const itemVistoriaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'item-vistoria_restore_many',
  description: dictionary.itemVistoria.mcpDescription.restore,
  requiredPermissions: { itemVistoria: ['restore'] },
  schema: toMcpJsonSchema(itemVistoriaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaRestoreManyController(params, context);
  },
});

export async function itemVistoriaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['restore'],
    },
    context,
  );

  const { ids } = itemVistoriaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldItensVistoria = await tx.itemVistoria.findMany({
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

      const result = await tx.itemVistoria.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newItensVistoria = await tx.itemVistoria.findMany({
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

      for (const oldItemVistoria of oldItensVistoria) {
        const newItemVistoria = newItensVistoria.find(
          (c) => c.id === oldItemVistoria.id,
        );
        await auditLogCreate({
          entityId: oldItemVistoria.id,
          entityName: 'ItemVistoria',
          operation: auditLogOperations.update,
          context,
          oldData: oldItemVistoria,
          newData: newItemVistoria,
          tx,
        });
      }

      return result;
    },
  );
}

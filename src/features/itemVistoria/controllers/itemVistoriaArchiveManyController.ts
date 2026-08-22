import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { itemVistoriaArchiveManyInputSchema as itemVistoriaArchiveManyInputSchema } from '../itemVistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/item-vistoria/archive',
  query: itemVistoriaArchiveManyInputSchema,
};

export const itemVistoriaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'item-vistoria_archive_many',
  description: dictionary.itemVistoria.mcpDescription.archive,
  requiredPermissions: { itemVistoria: ['archive'] },
  schema: toMcpJsonSchema(itemVistoriaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaArchiveManyController(params, context);
  },
});

export async function itemVistoriaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['archive'],
    },
    context,
  );

  const { ids } = itemVistoriaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

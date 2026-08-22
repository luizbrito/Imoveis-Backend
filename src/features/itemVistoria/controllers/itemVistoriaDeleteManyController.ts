import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { itemVistoriaDeleteManyInputSchema } from '../itemVistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/item-vistoria',
  query: itemVistoriaDeleteManyInputSchema,
};

export const itemVistoriaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'itemVistoria_delete_many',
  description: dictionary.itemVistoria.mcpDescription.delete,
  requiredPermissions: { itemVistoria: ['delete'] },
  schema: toMcpJsonSchema(itemVistoriaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaDeleteManyController(params, context);
  },
});

export async function itemVistoriaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['delete'],
    },
    context,
  );

  const { ids } = itemVistoriaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const itensVistoriaToDelete = await tx.itemVistoria.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          vistoria: {
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

      const result = await tx.itemVistoria.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const itemVistoria of itensVistoriaToDelete) {
        await auditLogCreate({
          entityId: itemVistoria.id,
          entityName: 'ItemVistoria',
          operation: auditLogOperations.delete,
          context,
          oldData: itemVistoria,
          tx,
        });
      }

      return result;
    },
  );
}

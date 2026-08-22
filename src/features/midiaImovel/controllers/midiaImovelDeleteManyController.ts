import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { midiaImovelDeleteManyInputSchema } from '../midiaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/midia-imovel',
  query: midiaImovelDeleteManyInputSchema,
};

export const midiaImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midiaImovel_delete_many',
  description: dictionary.midiaImovel.mcpDescription.delete,
  requiredPermissions: { midiaImovel: ['delete'] },
  schema: toMcpJsonSchema(midiaImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await midiaImovelDeleteManyController(params, context);
  },
});

export async function midiaImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['delete'],
    },
    context,
  );

  const { ids } = midiaImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const midiasImovelToDelete = await tx.midiaImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
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

      const result = await tx.midiaImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const midiaImovel of midiasImovelToDelete) {
        await auditLogCreate({
          entityId: midiaImovel.id,
          entityName: 'MidiaImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: midiaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

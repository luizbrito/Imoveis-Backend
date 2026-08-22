import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { topografiaRuralDeleteManyInputSchema } from '../topografiaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/topografia-rural',
  query: topografiaRuralDeleteManyInputSchema,
};

export const topografiaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_delete_many',
  description: dictionary.topografiaRural.mcpDescription.delete,
  requiredPermissions: { topografiaRural: ['delete'] },
  schema: toMcpJsonSchema(topografiaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralDeleteManyController(params, context);
  },
});

export async function topografiaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['delete'],
    },
    context,
  );

  const { ids } = topografiaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const topografiasRuraisToDelete = await tx.topografiaRural.findMany({
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

      const result = await tx.topografiaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const topografiaRural of topografiasRuraisToDelete) {
        await auditLogCreate({
          entityId: topografiaRural.id,
          entityName: 'TopografiaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: topografiaRural,
          tx,
        });
      }

      return result;
    },
  );
}

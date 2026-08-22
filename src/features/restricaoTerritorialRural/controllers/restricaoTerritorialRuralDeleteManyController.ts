import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { restricaoTerritorialRuralDeleteManyInputSchema } from '../restricaoTerritorialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/restricao-territorial-rural',
  query: restricaoTerritorialRuralDeleteManyInputSchema,
};

export const restricaoTerritorialRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_delete_many',
  description: dictionary.restricaoTerritorialRural.mcpDescription.delete,
  requiredPermissions: { restricaoTerritorialRural: ['delete'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralDeleteManyController(params, context);
  },
});

export async function restricaoTerritorialRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['delete'],
    },
    context,
  );

  const { ids } = restricaoTerritorialRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const restricoesTerritoriaisRuraisToDelete =
        await tx.restricaoTerritorialRural.findMany({
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

      const result = await tx.restricaoTerritorialRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const restricaoTerritorialRural of restricoesTerritoriaisRuraisToDelete) {
        await auditLogCreate({
          entityId: restricaoTerritorialRural.id,
          entityName: 'RestricaoTerritorialRural',
          operation: auditLogOperations.delete,
          context,
          oldData: restricaoTerritorialRural,
          tx,
        });
      }

      return result;
    },
  );
}

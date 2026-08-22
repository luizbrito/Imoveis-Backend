import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { soloImovelRuralDeleteManyInputSchema } from '../soloImovelRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/solo-imovel-rural',
  query: soloImovelRuralDeleteManyInputSchema,
};

export const soloImovelRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_delete_many',
  description: dictionary.soloImovelRural.mcpDescription.delete,
  requiredPermissions: { soloImovelRural: ['delete'] },
  schema: toMcpJsonSchema(soloImovelRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralDeleteManyController(params, context);
  },
});

export async function soloImovelRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['delete'],
    },
    context,
  );

  const { ids } = soloImovelRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const solosImoveisRuraisToDelete = await tx.soloImovelRural.findMany({
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
          tipoSolo: {
            select: {
              id: true,
              nome: true,
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

      const result = await tx.soloImovelRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const soloImovelRural of solosImoveisRuraisToDelete) {
        await auditLogCreate({
          entityId: soloImovelRural.id,
          entityName: 'SoloImovelRural',
          operation: auditLogOperations.delete,
          context,
          oldData: soloImovelRural,
          tx,
        });
      }

      return result;
    },
  );
}

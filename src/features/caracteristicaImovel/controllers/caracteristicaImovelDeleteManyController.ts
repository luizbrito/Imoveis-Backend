import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { caracteristicaImovelDeleteManyInputSchema } from '../caracteristicaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/caracteristica-imovel',
  query: caracteristicaImovelDeleteManyInputSchema,
};

export const caracteristicaImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_delete_many',
  description: dictionary.caracteristicaImovel.mcpDescription.delete,
  requiredPermissions: { caracteristicaImovel: ['delete'] },
  schema: toMcpJsonSchema(caracteristicaImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelDeleteManyController(params, context);
  },
});

export async function caracteristicaImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['delete'],
    },
    context,
  );

  const { ids } = caracteristicaImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const caracteristicasImovelToDelete =
        await tx.caracteristicaImovel.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            imoveisVinculados: {
              select: {
                id: true,
                valorTexto: true,
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

      const result = await tx.caracteristicaImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const caracteristicaImovel of caracteristicasImovelToDelete) {
        await auditLogCreate({
          entityId: caracteristicaImovel.id,
          entityName: 'CaracteristicaImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: caracteristicaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

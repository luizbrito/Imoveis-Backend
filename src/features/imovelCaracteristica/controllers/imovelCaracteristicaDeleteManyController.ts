import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelCaracteristicaDeleteManyInputSchema } from '../imovelCaracteristicaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/imovel-caracteristica',
  query: imovelCaracteristicaDeleteManyInputSchema,
};

export const imovelCaracteristicaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_delete_many',
  description: dictionary.imovelCaracteristica.mcpDescription.delete,
  requiredPermissions: { imovelCaracteristica: ['delete'] },
  schema: toMcpJsonSchema(imovelCaracteristicaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaDeleteManyController(params, context);
  },
});

export async function imovelCaracteristicaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['delete'],
    },
    context,
  );

  const { ids } = imovelCaracteristicaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const imoveisCaracteristicasToDelete =
        await tx.imovelCaracteristica.findMany({
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
            caracteristica: {
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

      const result = await tx.imovelCaracteristica.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const imovelCaracteristica of imoveisCaracteristicasToDelete) {
        await auditLogCreate({
          entityId: imovelCaracteristica.id,
          entityName: 'ImovelCaracteristica',
          operation: auditLogOperations.delete,
          context,
          oldData: imovelCaracteristica,
          tx,
        });
      }

      return result;
    },
  );
}

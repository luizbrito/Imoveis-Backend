import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoComercialRuralDeleteManyInputSchema } from '../condicaoComercialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/condicao-comercial-rural',
  query: condicaoComercialRuralDeleteManyInputSchema,
};

export const condicaoComercialRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_delete_many',
  description: dictionary.condicaoComercialRural.mcpDescription.delete,
  requiredPermissions: { condicaoComercialRural: ['delete'] },
  schema: toMcpJsonSchema(condicaoComercialRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralDeleteManyController(params, context);
  },
});

export async function condicaoComercialRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['delete'],
    },
    context,
  );

  const { ids } = condicaoComercialRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const condicoesComerciaisRuraisToDelete =
        await tx.condicaoComercialRural.findMany({
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

      const result = await tx.condicaoComercialRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const condicaoComercialRural of condicoesComerciaisRuraisToDelete) {
        await auditLogCreate({
          entityId: condicaoComercialRural.id,
          entityName: 'CondicaoComercialRural',
          operation: auditLogOperations.delete,
          context,
          oldData: condicaoComercialRural,
          tx,
        });
      }

      return result;
    },
  );
}

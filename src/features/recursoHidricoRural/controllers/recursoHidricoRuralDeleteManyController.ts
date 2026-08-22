import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { recursoHidricoRuralDeleteManyInputSchema } from '../recursoHidricoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/recurso-hidrico-rural',
  query: recursoHidricoRuralDeleteManyInputSchema,
};

export const recursoHidricoRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_delete_many',
  description: dictionary.recursoHidricoRural.mcpDescription.delete,
  requiredPermissions: { recursoHidricoRural: ['delete'] },
  schema: toMcpJsonSchema(recursoHidricoRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralDeleteManyController(params, context);
  },
});

export async function recursoHidricoRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['delete'],
    },
    context,
  );

  const { ids } = recursoHidricoRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const recursosHidricosRuraisToDelete =
        await tx.recursoHidricoRural.findMany({
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

      const result = await tx.recursoHidricoRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const recursoHidricoRural of recursosHidricosRuraisToDelete) {
        await auditLogCreate({
          entityId: recursoHidricoRural.id,
          entityName: 'RecursoHidricoRural',
          operation: auditLogOperations.delete,
          context,
          oldData: recursoHidricoRural,
          tx,
        });
      }

      return result;
    },
  );
}

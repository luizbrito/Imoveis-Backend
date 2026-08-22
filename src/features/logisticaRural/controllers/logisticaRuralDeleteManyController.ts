import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { logisticaRuralDeleteManyInputSchema } from '../logisticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/logistica-rural',
  query: logisticaRuralDeleteManyInputSchema,
};

export const logisticaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_delete_many',
  description: dictionary.logisticaRural.mcpDescription.delete,
  requiredPermissions: { logisticaRural: ['delete'] },
  schema: toMcpJsonSchema(logisticaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralDeleteManyController(params, context);
  },
});

export async function logisticaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['delete'],
    },
    context,
  );

  const { ids } = logisticaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const logisticasRuraisToDelete = await tx.logisticaRural.findMany({
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

      const result = await tx.logisticaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const logisticaRural of logisticasRuraisToDelete) {
        await auditLogCreate({
          entityId: logisticaRural.id,
          entityName: 'LogisticaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: logisticaRural,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { benfeitoriaRuralDeleteManyInputSchema } from '../benfeitoriaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/benfeitoria-rural',
  query: benfeitoriaRuralDeleteManyInputSchema,
};

export const benfeitoriaRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_delete_many',
  description: dictionary.benfeitoriaRural.mcpDescription.delete,
  requiredPermissions: { benfeitoriaRural: ['delete'] },
  schema: toMcpJsonSchema(benfeitoriaRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralDeleteManyController(params, context);
  },
});

export async function benfeitoriaRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['delete'],
    },
    context,
  );

  const { ids } = benfeitoriaRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const benfeitoriasRuraisToDelete = await tx.benfeitoriaRural.findMany({
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

      const result = await tx.benfeitoriaRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const benfeitoriaRural of benfeitoriasRuraisToDelete) {
        await auditLogCreate({
          entityId: benfeitoriaRural.id,
          entityName: 'BenfeitoriaRural',
          operation: auditLogOperations.delete,
          context,
          oldData: benfeitoriaRural,
          tx,
        });
      }

      return result;
    },
  );
}

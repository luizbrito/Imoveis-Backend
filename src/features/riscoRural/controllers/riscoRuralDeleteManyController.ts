import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { riscoRuralDeleteManyInputSchema } from '../riscoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/risco-rural',
  query: riscoRuralDeleteManyInputSchema,
};

export const riscoRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'riscoRural_delete_many',
  description: dictionary.riscoRural.mcpDescription.delete,
  requiredPermissions: { riscoRural: ['delete'] },
  schema: toMcpJsonSchema(riscoRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await riscoRuralDeleteManyController(params, context);
  },
});

export async function riscoRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['delete'],
    },
    context,
  );

  const { ids } = riscoRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const riscosRuraisToDelete = await tx.riscoRural.findMany({
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

      const result = await tx.riscoRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const riscoRural of riscosRuraisToDelete) {
        await auditLogCreate({
          entityId: riscoRural.id,
          entityName: 'RiscoRural',
          operation: auditLogOperations.delete,
          context,
          oldData: riscoRural,
          tx,
        });
      }

      return result;
    },
  );
}

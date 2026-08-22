import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { dueDiligenceRuralDeleteManyInputSchema } from '../dueDiligenceRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/due-diligence-rural',
  query: dueDiligenceRuralDeleteManyInputSchema,
};

export const dueDiligenceRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_delete_many',
  description: dictionary.dueDiligenceRural.mcpDescription.delete,
  requiredPermissions: { dueDiligenceRural: ['delete'] },
  schema: toMcpJsonSchema(dueDiligenceRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralDeleteManyController(params, context);
  },
});

export async function dueDiligenceRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['delete'],
    },
    context,
  );

  const { ids } = dueDiligenceRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const dueDiligencesRuraisToDelete = await tx.dueDiligenceRural.findMany({
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

      const result = await tx.dueDiligenceRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const dueDiligenceRural of dueDiligencesRuraisToDelete) {
        await auditLogCreate({
          entityId: dueDiligenceRural.id,
          entityName: 'DueDiligenceRural',
          operation: auditLogOperations.delete,
          context,
          oldData: dueDiligenceRural,
          tx,
        });
      }

      return result;
    },
  );
}

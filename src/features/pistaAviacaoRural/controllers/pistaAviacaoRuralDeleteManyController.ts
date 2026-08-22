import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pistaAviacaoRuralDeleteManyInputSchema } from '../pistaAviacaoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/pista-aviacao-rural',
  query: pistaAviacaoRuralDeleteManyInputSchema,
};

export const pistaAviacaoRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_delete_many',
  description: dictionary.pistaAviacaoRural.mcpDescription.delete,
  requiredPermissions: { pistaAviacaoRural: ['delete'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralDeleteManyController(params, context);
  },
});

export async function pistaAviacaoRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['delete'],
    },
    context,
  );

  const { ids } = pistaAviacaoRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const pistasAviacaoRuraisToDelete = await tx.pistaAviacaoRural.findMany({
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

      const result = await tx.pistaAviacaoRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const pistaAviacaoRural of pistasAviacaoRuraisToDelete) {
        await auditLogCreate({
          entityId: pistaAviacaoRural.id,
          entityName: 'PistaAviacaoRural',
          operation: auditLogOperations.delete,
          context,
          oldData: pistaAviacaoRural,
          tx,
        });
      }

      return result;
    },
  );
}

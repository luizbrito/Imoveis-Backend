import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { divisaoOperacionalRuralDeleteManyInputSchema } from '../divisaoOperacionalRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/divisao-operacional-rural',
  query: divisaoOperacionalRuralDeleteManyInputSchema,
};

export const divisaoOperacionalRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_delete_many',
  description: dictionary.divisaoOperacionalRural.mcpDescription.delete,
  requiredPermissions: { divisaoOperacionalRural: ['delete'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralDeleteManyController(params, context);
  },
});

export async function divisaoOperacionalRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['delete'],
    },
    context,
  );

  const { ids } = divisaoOperacionalRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const divisoesOperacionaisRuraisToDelete =
        await tx.divisaoOperacionalRural.findMany({
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

      const result = await tx.divisaoOperacionalRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const divisaoOperacionalRural of divisoesOperacionaisRuraisToDelete) {
        await auditLogCreate({
          entityId: divisaoOperacionalRural.id,
          entityName: 'DivisaoOperacionalRural',
          operation: auditLogOperations.delete,
          context,
          oldData: divisaoOperacionalRural,
          tx,
        });
      }

      return result;
    },
  );
}

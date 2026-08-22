import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaMarketingDeleteManyInputSchema } from '../campanhaMarketingSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/campanha-marketing',
  query: campanhaMarketingDeleteManyInputSchema,
};

export const campanhaMarketingDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_delete_many',
  description: dictionary.campanhaMarketing.mcpDescription.delete,
  requiredPermissions: { campanhaMarketing: ['delete'] },
  schema: toMcpJsonSchema(campanhaMarketingDeleteManyInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingDeleteManyController(params, context);
  },
});

export async function campanhaMarketingDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['delete'],
    },
    context,
  );

  const { ids } = campanhaMarketingDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const campanhasMarketingToDelete = await tx.campanhaMarketing.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          anunciosVinculados: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
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

      const result = await tx.campanhaMarketing.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const campanhaMarketing of campanhasMarketingToDelete) {
        await auditLogCreate({
          entityId: campanhaMarketing.id,
          entityName: 'CampanhaMarketing',
          operation: auditLogOperations.delete,
          context,
          oldData: campanhaMarketing,
          tx,
        });
      }

      return result;
    },
  );
}

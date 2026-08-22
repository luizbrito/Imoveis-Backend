import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaMarketingRestoreManyInputSchema } from '../campanhaMarketingSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-marketing/restore',
  query: campanhaMarketingRestoreManyInputSchema,
};

export const campanhaMarketingRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanha-marketing_restore_many',
  description: dictionary.campanhaMarketing.mcpDescription.restore,
  requiredPermissions: { campanhaMarketing: ['restore'] },
  schema: toMcpJsonSchema(campanhaMarketingRestoreManyInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingRestoreManyController(params, context);
  },
});

export async function campanhaMarketingRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['restore'],
    },
    context,
  );

  const { ids } = campanhaMarketingRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCampanhasMarketing = await tx.campanhaMarketing.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.campanhaMarketing.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCampanhasMarketing = await tx.campanhaMarketing.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldCampanhaMarketing of oldCampanhasMarketing) {
        const newCampanhaMarketing = newCampanhasMarketing.find(
          (c) => c.id === oldCampanhaMarketing.id,
        );
        await auditLogCreate({
          entityId: oldCampanhaMarketing.id,
          entityName: 'CampanhaMarketing',
          operation: auditLogOperations.update,
          context,
          oldData: oldCampanhaMarketing,
          newData: newCampanhaMarketing,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaMarketingArchiveManyInputSchema as campanhaMarketingArchiveManyInputSchema } from '../campanhaMarketingSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/campanha-marketing/archive',
  query: campanhaMarketingArchiveManyInputSchema,
};

export const campanhaMarketingArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanha-marketing_archive_many',
  description: dictionary.campanhaMarketing.mcpDescription.archive,
  requiredPermissions: { campanhaMarketing: ['archive'] },
  schema: toMcpJsonSchema(campanhaMarketingArchiveManyInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingArchiveManyController(params, context);
  },
});

export async function campanhaMarketingArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['archive'],
    },
    context,
  );

  const { ids } = campanhaMarketingArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

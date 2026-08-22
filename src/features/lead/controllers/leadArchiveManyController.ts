import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { leadArchiveManyInputSchema as leadArchiveManyInputSchema } from '../leadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lead/archive',
  query: leadArchiveManyInputSchema,
};

export const leadArchiveManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_archive_many',
  description: dictionary.lead.mcpDescription.archive,
  requiredPermissions: { lead: ['archive'] },
  schema: toMcpJsonSchema(leadArchiveManyInputSchema),
  handler: async (params, context) => {
    return await leadArchiveManyController(params, context);
  },
});

export async function leadArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      lead: ['archive'],
    },
    context,
  );

  const { ids } = leadArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldLeads = await tx.lead.findMany({
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

      const result = await tx.lead.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newLeads = await tx.lead.findMany({
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

      for (const oldLead of oldLeads) {
        const newLead = newLeads.find((c) => c.id === oldLead.id);
        await auditLogCreate({
          entityId: oldLead.id,
          entityName: 'Lead',
          operation: auditLogOperations.update,
          context,
          oldData: oldLead,
          newData: newLead,
          tx,
        });
      }

      return result;
    },
  );
}

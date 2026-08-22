import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { leadRestoreManyInputSchema } from '../leadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lead/restore',
  query: leadRestoreManyInputSchema,
};

export const leadRestoreManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_restore_many',
  description: dictionary.lead.mcpDescription.restore,
  requiredPermissions: { lead: ['restore'] },
  schema: toMcpJsonSchema(leadRestoreManyInputSchema),
  handler: async (params, context) => {
    return await leadRestoreManyController(params, context);
  },
});

export async function leadRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['restore'],
    },
    context,
  );

  const { ids } = leadRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

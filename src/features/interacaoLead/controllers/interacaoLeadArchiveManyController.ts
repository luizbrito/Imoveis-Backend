import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { interacaoLeadArchiveManyInputSchema as interacaoLeadArchiveManyInputSchema } from '../interacaoLeadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/interacao-lead/archive',
  query: interacaoLeadArchiveManyInputSchema,
};

export const interacaoLeadArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacao-lead_archive_many',
  description: dictionary.interacaoLead.mcpDescription.archive,
  requiredPermissions: { interacaoLead: ['archive'] },
  schema: toMcpJsonSchema(interacaoLeadArchiveManyInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadArchiveManyController(params, context);
  },
});

export async function interacaoLeadArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['archive'],
    },
    context,
  );

  const { ids } = interacaoLeadArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldInteracoesLead = await tx.interacaoLead.findMany({
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

      const result = await tx.interacaoLead.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newInteracoesLead = await tx.interacaoLead.findMany({
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

      for (const oldInteracaoLead of oldInteracoesLead) {
        const newInteracaoLead = newInteracoesLead.find(
          (c) => c.id === oldInteracaoLead.id,
        );
        await auditLogCreate({
          entityId: oldInteracaoLead.id,
          entityName: 'InteracaoLead',
          operation: auditLogOperations.update,
          context,
          oldData: oldInteracaoLead,
          newData: newInteracaoLead,
          tx,
        });
      }

      return result;
    },
  );
}

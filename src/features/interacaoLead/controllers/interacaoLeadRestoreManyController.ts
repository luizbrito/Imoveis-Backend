import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { interacaoLeadRestoreManyInputSchema } from '../interacaoLeadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/interacao-lead/restore',
  query: interacaoLeadRestoreManyInputSchema,
};

export const interacaoLeadRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacao-lead_restore_many',
  description: dictionary.interacaoLead.mcpDescription.restore,
  requiredPermissions: { interacaoLead: ['restore'] },
  schema: toMcpJsonSchema(interacaoLeadRestoreManyInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadRestoreManyController(params, context);
  },
});

export async function interacaoLeadRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['restore'],
    },
    context,
  );

  const { ids } = interacaoLeadRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

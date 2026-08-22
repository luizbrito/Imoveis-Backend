import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { dueDiligenceRuralRestoreManyInputSchema } from '../dueDiligenceRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/due-diligence-rural/restore',
  query: dueDiligenceRuralRestoreManyInputSchema,
};

export const dueDiligenceRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'due-diligence-rural_restore_many',
  description: dictionary.dueDiligenceRural.mcpDescription.restore,
  requiredPermissions: { dueDiligenceRural: ['restore'] },
  schema: toMcpJsonSchema(dueDiligenceRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralRestoreManyController(params, context);
  },
});

export async function dueDiligenceRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['restore'],
    },
    context,
  );

  const { ids } = dueDiligenceRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldDueDiligencesRurais = await tx.dueDiligenceRural.findMany({
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

      const result = await tx.dueDiligenceRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newDueDiligencesRurais = await tx.dueDiligenceRural.findMany({
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

      for (const oldDueDiligenceRural of oldDueDiligencesRurais) {
        const newDueDiligenceRural = newDueDiligencesRurais.find(
          (c) => c.id === oldDueDiligenceRural.id,
        );
        await auditLogCreate({
          entityId: oldDueDiligenceRural.id,
          entityName: 'DueDiligenceRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldDueDiligenceRural,
          newData: newDueDiligenceRural,
          tx,
        });
      }

      return result;
    },
  );
}

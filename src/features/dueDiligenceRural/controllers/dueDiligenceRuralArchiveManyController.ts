import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { dueDiligenceRuralArchiveManyInputSchema as dueDiligenceRuralArchiveManyInputSchema } from '../dueDiligenceRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/due-diligence-rural/archive',
  query: dueDiligenceRuralArchiveManyInputSchema,
};

export const dueDiligenceRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'due-diligence-rural_archive_many',
  description: dictionary.dueDiligenceRural.mcpDescription.archive,
  requiredPermissions: { dueDiligenceRural: ['archive'] },
  schema: toMcpJsonSchema(dueDiligenceRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralArchiveManyController(params, context);
  },
});

export async function dueDiligenceRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['archive'],
    },
    context,
  );

  const { ids } = dueDiligenceRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

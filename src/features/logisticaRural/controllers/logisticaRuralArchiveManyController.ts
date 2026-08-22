import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { logisticaRuralArchiveManyInputSchema as logisticaRuralArchiveManyInputSchema } from '../logisticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/logistica-rural/archive',
  query: logisticaRuralArchiveManyInputSchema,
};

export const logisticaRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logistica-rural_archive_many',
  description: dictionary.logisticaRural.mcpDescription.archive,
  requiredPermissions: { logisticaRural: ['archive'] },
  schema: toMcpJsonSchema(logisticaRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralArchiveManyController(params, context);
  },
});

export async function logisticaRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['archive'],
    },
    context,
  );

  const { ids } = logisticaRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldLogisticasRurais = await tx.logisticaRural.findMany({
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

      const result = await tx.logisticaRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newLogisticasRurais = await tx.logisticaRural.findMany({
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

      for (const oldLogisticaRural of oldLogisticasRurais) {
        const newLogisticaRural = newLogisticasRurais.find(
          (c) => c.id === oldLogisticaRural.id,
        );
        await auditLogCreate({
          entityId: oldLogisticaRural.id,
          entityName: 'LogisticaRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldLogisticaRural,
          newData: newLogisticaRural,
          tx,
        });
      }

      return result;
    },
  );
}

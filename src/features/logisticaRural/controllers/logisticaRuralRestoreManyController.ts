import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { logisticaRuralRestoreManyInputSchema } from '../logisticaRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/logistica-rural/restore',
  query: logisticaRuralRestoreManyInputSchema,
};

export const logisticaRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logistica-rural_restore_many',
  description: dictionary.logisticaRural.mcpDescription.restore,
  requiredPermissions: { logisticaRural: ['restore'] },
  schema: toMcpJsonSchema(logisticaRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralRestoreManyController(params, context);
  },
});

export async function logisticaRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['restore'],
    },
    context,
  );

  const { ids } = logisticaRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

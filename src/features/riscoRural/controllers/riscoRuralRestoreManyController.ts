import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { riscoRuralRestoreManyInputSchema } from '../riscoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/risco-rural/restore',
  query: riscoRuralRestoreManyInputSchema,
};

export const riscoRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'risco-rural_restore_many',
  description: dictionary.riscoRural.mcpDescription.restore,
  requiredPermissions: { riscoRural: ['restore'] },
  schema: toMcpJsonSchema(riscoRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await riscoRuralRestoreManyController(params, context);
  },
});

export async function riscoRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['restore'],
    },
    context,
  );

  const { ids } = riscoRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldRiscosRurais = await tx.riscoRural.findMany({
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

      const result = await tx.riscoRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newRiscosRurais = await tx.riscoRural.findMany({
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

      for (const oldRiscoRural of oldRiscosRurais) {
        const newRiscoRural = newRiscosRurais.find(
          (c) => c.id === oldRiscoRural.id,
        );
        await auditLogCreate({
          entityId: oldRiscoRural.id,
          entityName: 'RiscoRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldRiscoRural,
          newData: newRiscoRural,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { restricaoTerritorialRuralRestoreManyInputSchema } from '../restricaoTerritorialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/restricao-territorial-rural/restore',
  query: restricaoTerritorialRuralRestoreManyInputSchema,
};

export const restricaoTerritorialRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricao-territorial-rural_restore_many',
  description: dictionary.restricaoTerritorialRural.mcpDescription.restore,
  requiredPermissions: { restricaoTerritorialRural: ['restore'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralRestoreManyController(
      params,
      context,
    );
  },
});

export async function restricaoTerritorialRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['restore'],
    },
    context,
  );

  const { ids } = restricaoTerritorialRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldRestricoesTerritoriaisRurais =
        await tx.restricaoTerritorialRural.findMany({
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

      const result = await tx.restricaoTerritorialRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newRestricoesTerritoriaisRurais =
        await tx.restricaoTerritorialRural.findMany({
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

      for (const oldRestricaoTerritorialRural of oldRestricoesTerritoriaisRurais) {
        const newRestricaoTerritorialRural =
          newRestricoesTerritoriaisRurais.find(
            (c) => c.id === oldRestricaoTerritorialRural.id,
          );
        await auditLogCreate({
          entityId: oldRestricaoTerritorialRural.id,
          entityName: 'RestricaoTerritorialRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldRestricaoTerritorialRural,
          newData: newRestricaoTerritorialRural,
          tx,
        });
      }

      return result;
    },
  );
}

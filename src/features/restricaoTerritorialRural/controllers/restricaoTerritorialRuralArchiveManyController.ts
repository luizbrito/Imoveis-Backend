import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { restricaoTerritorialRuralArchiveManyInputSchema as restricaoTerritorialRuralArchiveManyInputSchema } from '../restricaoTerritorialRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/restricao-territorial-rural/archive',
  query: restricaoTerritorialRuralArchiveManyInputSchema,
};

export const restricaoTerritorialRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricao-territorial-rural_archive_many',
  description: dictionary.restricaoTerritorialRural.mcpDescription.archive,
  requiredPermissions: { restricaoTerritorialRural: ['archive'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralArchiveManyController(
      params,
      context,
    );
  },
});

export async function restricaoTerritorialRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['archive'],
    },
    context,
  );

  const { ids } = restricaoTerritorialRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

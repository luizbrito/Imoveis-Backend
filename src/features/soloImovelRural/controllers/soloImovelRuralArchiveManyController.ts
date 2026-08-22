import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { soloImovelRuralArchiveManyInputSchema as soloImovelRuralArchiveManyInputSchema } from '../soloImovelRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solo-imovel-rural/archive',
  query: soloImovelRuralArchiveManyInputSchema,
};

export const soloImovelRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solo-imovel-rural_archive_many',
  description: dictionary.soloImovelRural.mcpDescription.archive,
  requiredPermissions: { soloImovelRural: ['archive'] },
  schema: toMcpJsonSchema(soloImovelRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralArchiveManyController(params, context);
  },
});

export async function soloImovelRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['archive'],
    },
    context,
  );

  const { ids } = soloImovelRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSolosImoveisRurais = await tx.soloImovelRural.findMany({
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

      const result = await tx.soloImovelRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newSolosImoveisRurais = await tx.soloImovelRural.findMany({
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

      for (const oldSoloImovelRural of oldSolosImoveisRurais) {
        const newSoloImovelRural = newSolosImoveisRurais.find(
          (c) => c.id === oldSoloImovelRural.id,
        );
        await auditLogCreate({
          entityId: oldSoloImovelRural.id,
          entityName: 'SoloImovelRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldSoloImovelRural,
          newData: newSoloImovelRural,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { soloImovelRuralRestoreManyInputSchema } from '../soloImovelRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solo-imovel-rural/restore',
  query: soloImovelRuralRestoreManyInputSchema,
};

export const soloImovelRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solo-imovel-rural_restore_many',
  description: dictionary.soloImovelRural.mcpDescription.restore,
  requiredPermissions: { soloImovelRural: ['restore'] },
  schema: toMcpJsonSchema(soloImovelRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralRestoreManyController(params, context);
  },
});

export async function soloImovelRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['restore'],
    },
    context,
  );

  const { ids } = soloImovelRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

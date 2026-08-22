import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelCaracteristicaRestoreManyInputSchema } from '../imovelCaracteristicaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/imovel-caracteristica/restore',
  query: imovelCaracteristicaRestoreManyInputSchema,
};

export const imovelCaracteristicaRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovel-caracteristica_restore_many',
  description: dictionary.imovelCaracteristica.mcpDescription.restore,
  requiredPermissions: { imovelCaracteristica: ['restore'] },
  schema: toMcpJsonSchema(imovelCaracteristicaRestoreManyInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaRestoreManyController(params, context);
  },
});

export async function imovelCaracteristicaRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['restore'],
    },
    context,
  );

  const { ids } = imovelCaracteristicaRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldImoveisCaracteristicas = await tx.imovelCaracteristica.findMany({
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

      const result = await tx.imovelCaracteristica.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newImoveisCaracteristicas = await tx.imovelCaracteristica.findMany({
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

      for (const oldImovelCaracteristica of oldImoveisCaracteristicas) {
        const newImovelCaracteristica = newImoveisCaracteristicas.find(
          (c) => c.id === oldImovelCaracteristica.id,
        );
        await auditLogCreate({
          entityId: oldImovelCaracteristica.id,
          entityName: 'ImovelCaracteristica',
          operation: auditLogOperations.update,
          context,
          oldData: oldImovelCaracteristica,
          newData: newImovelCaracteristica,
          tx,
        });
      }

      return result;
    },
  );
}

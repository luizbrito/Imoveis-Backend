import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelCaracteristicaArchiveManyInputSchema as imovelCaracteristicaArchiveManyInputSchema } from '../imovelCaracteristicaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/imovel-caracteristica/archive',
  query: imovelCaracteristicaArchiveManyInputSchema,
};

export const imovelCaracteristicaArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovel-caracteristica_archive_many',
  description: dictionary.imovelCaracteristica.mcpDescription.archive,
  requiredPermissions: { imovelCaracteristica: ['archive'] },
  schema: toMcpJsonSchema(imovelCaracteristicaArchiveManyInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaArchiveManyController(params, context);
  },
});

export async function imovelCaracteristicaArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['archive'],
    },
    context,
  );

  const { ids } = imovelCaracteristicaArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

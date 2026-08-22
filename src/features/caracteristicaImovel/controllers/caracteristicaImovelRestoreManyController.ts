import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { caracteristicaImovelRestoreManyInputSchema } from '../caracteristicaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/caracteristica-imovel/restore',
  query: caracteristicaImovelRestoreManyInputSchema,
};

export const caracteristicaImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristica-imovel_restore_many',
  description: dictionary.caracteristicaImovel.mcpDescription.restore,
  requiredPermissions: { caracteristicaImovel: ['restore'] },
  schema: toMcpJsonSchema(caracteristicaImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelRestoreManyController(params, context);
  },
});

export async function caracteristicaImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['restore'],
    },
    context,
  );

  const { ids } = caracteristicaImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCaracteristicasImovel = await tx.caracteristicaImovel.findMany({
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

      const result = await tx.caracteristicaImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCaracteristicasImovel = await tx.caracteristicaImovel.findMany({
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

      for (const oldCaracteristicaImovel of oldCaracteristicasImovel) {
        const newCaracteristicaImovel = newCaracteristicasImovel.find(
          (c) => c.id === oldCaracteristicaImovel.id,
        );
        await auditLogCreate({
          entityId: oldCaracteristicaImovel.id,
          entityName: 'CaracteristicaImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldCaracteristicaImovel,
          newData: newCaracteristicaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

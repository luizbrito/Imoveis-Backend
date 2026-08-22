import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { caracteristicaImovelArchiveManyInputSchema as caracteristicaImovelArchiveManyInputSchema } from '../caracteristicaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/caracteristica-imovel/archive',
  query: caracteristicaImovelArchiveManyInputSchema,
};

export const caracteristicaImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristica-imovel_archive_many',
  description: dictionary.caracteristicaImovel.mcpDescription.archive,
  requiredPermissions: { caracteristicaImovel: ['archive'] },
  schema: toMcpJsonSchema(caracteristicaImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelArchiveManyController(params, context);
  },
});

export async function caracteristicaImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['archive'],
    },
    context,
  );

  const { ids } = caracteristicaImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

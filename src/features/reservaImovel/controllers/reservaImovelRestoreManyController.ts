import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reservaImovelRestoreManyInputSchema } from '../reservaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reserva-imovel/restore',
  query: reservaImovelRestoreManyInputSchema,
};

export const reservaImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reserva-imovel_restore_many',
  description: dictionary.reservaImovel.mcpDescription.restore,
  requiredPermissions: { reservaImovel: ['restore'] },
  schema: toMcpJsonSchema(reservaImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await reservaImovelRestoreManyController(params, context);
  },
});

export async function reservaImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['restore'],
    },
    context,
  );

  const { ids } = reservaImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldReservasImovel = await tx.reservaImovel.findMany({
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

      const result = await tx.reservaImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newReservasImovel = await tx.reservaImovel.findMany({
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

      for (const oldReservaImovel of oldReservasImovel) {
        const newReservaImovel = newReservasImovel.find(
          (c) => c.id === oldReservaImovel.id,
        );
        await auditLogCreate({
          entityId: oldReservaImovel.id,
          entityName: 'ReservaImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldReservaImovel,
          newData: newReservaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

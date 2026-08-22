import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reservaImovelArchiveManyInputSchema as reservaImovelArchiveManyInputSchema } from '../reservaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/reserva-imovel/archive',
  query: reservaImovelArchiveManyInputSchema,
};

export const reservaImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reserva-imovel_archive_many',
  description: dictionary.reservaImovel.mcpDescription.archive,
  requiredPermissions: { reservaImovel: ['archive'] },
  schema: toMcpJsonSchema(reservaImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await reservaImovelArchiveManyController(params, context);
  },
});

export async function reservaImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['archive'],
    },
    context,
  );

  const { ids } = reservaImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reservaImovelDeleteManyInputSchema } from '../reservaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/reserva-imovel',
  query: reservaImovelDeleteManyInputSchema,
};

export const reservaImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_delete_many',
  description: dictionary.reservaImovel.mcpDescription.delete,
  requiredPermissions: { reservaImovel: ['delete'] },
  schema: toMcpJsonSchema(reservaImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await reservaImovelDeleteManyController(params, context);
  },
});

export async function reservaImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['delete'],
    },
    context,
  );

  const { ids } = reservaImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const reservasImovelToDelete = await tx.reservaImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          proposta: {
            select: {
              id: true,
              codigo: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.reservaImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const reservaImovel of reservasImovelToDelete) {
        await auditLogCreate({
          entityId: reservaImovel.id,
          entityName: 'ReservaImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: reservaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

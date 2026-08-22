import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reservaImovelFindSchema } from '../reservaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reserva-imovel/{id}',
  params: reservaImovelFindSchema,
  response: 'ReservaImovel',
};

export const reservaImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'reservaImovel_get',
  description: dictionary.reservaImovel.mcpDescription.get,
  requiredPermissions: { reservaImovel: ['read'] },
  schema: toMcpJsonSchema(reservaImovelFindSchema),
  handler: async (params, context) => {
    return await reservaImovelFindController(params, context);
  },
});

export async function reservaImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['read'],
    },
    context,
  );

  const { id } = reservaImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let reservaImovel = await tx.reservaImovel.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      reservaImovel = await filePopulateDownloadUrlInTree(reservaImovel);

      return reservaImovel;
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { reservaImovelFindManyInputSchema } from '../reservaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const reservaImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reserva-imovel',
  query: reservaImovelFindManyInputSchema,
  response: '{ reservasImovel: ReservaImovel[], count: number }',
};

export const reservaImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_list',
  description: dictionary.reservaImovel.mcpDescription.list,
  requiredPermissions: { reservaImovel: ['read'] },
  schema: toMcpJsonSchema(reservaImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await reservaImovelFindManyController(params, context);
  },
});

export async function reservaImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    reservaImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReservaImovelWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.dataInicioRange?.length) {
        const start = filter.dataInicioRange?.[0];
        const end = filter.dataInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimRange?.length) {
        const start = filter.dataFimRange?.[0];
        const end = filter.dataFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFim: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFim: {
              lte: end,
            },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.valorSinalRange?.length) {
        const start = filter.valorSinalRange?.[0];
        const end = filter.valorSinalRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorSinal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorSinal: { lte: end },
          });
        }
      }
      if (filter?.formaPagamentoSinal != null) {
        whereAnd.push({
          formaPagamentoSinal: filter?.formaPagamentoSinal,
        });
      }
      if (filter?.proposta != null) {
        whereAnd.push({
          proposta: {
            id: filter.proposta,
          },
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
          },
        });
      }
      if (filter?.corretor != null) {
        whereAnd.push({
          corretor: {
            id: filter.corretor,
          },
        });
      }
      if (filter?.createdByMember != null) {
        whereAnd.push({
          createdByMember: {
            id: filter.createdByMember,
          },
        });
      }

      if (filter?.updatedByMember != null) {
        whereAnd.push({
          updatedByMember: {
            id: filter.updatedByMember,
          },
        });
      }

      if (filter?.createdAtRange?.length) {
        const start = filter.createdAtRange?.[0];
        const end = filter.createdAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            createdAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            createdAt: {
              lte: end,
            },
          });
        }
      }

      if (filter?.updatedAtRange?.length) {
        const start = filter.updatedAtRange?.[0];
        const end = filter.updatedAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            updatedAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            updatedAt: {
              lte: end,
            },
          });
        }
      }

      let reservasImovel = await tx.reservaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          proposta: true,
          imovel: true,
          cliente: true,
          corretor: true,
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
        },
      });

      const count = await tx.reservaImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      reservasImovel = await filePopulateDownloadUrlInTree(reservasImovel);

      return { reservasImovel, count };
    },
  );
}

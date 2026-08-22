import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { avaliacaoImovelFindManyInputSchema } from '../avaliacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const avaliacaoImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/avaliacao-imovel',
  query: avaliacaoImovelFindManyInputSchema,
  response: '{ avaliacoesImovel: AvaliacaoImovel[], count: number }',
};

export const avaliacaoImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_list',
  description: dictionary.avaliacaoImovel.mcpDescription.list,
  requiredPermissions: { avaliacaoImovel: ['read'] },
  schema: toMcpJsonSchema(avaliacaoImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelFindManyController(params, context);
  },
});

export async function avaliacaoImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    avaliacaoImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AvaliacaoImovelWhereInput> = [];

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
      if (filter?.dataAvaliacaoRange?.length) {
        const start = filter.dataAvaliacaoRange?.[0];
        const end = filter.dataAvaliacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAvaliacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAvaliacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.metodo != null) {
        whereAnd.push({
          metodo: filter?.metodo,
        });
      }
      if (filter?.valorMercadoRange?.length) {
        const start = filter.valorMercadoRange?.[0];
        const end = filter.valorMercadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorMercado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorMercado: { lte: end },
          });
        }
      }
      if (filter?.valorVendaRapidaRange?.length) {
        const start = filter.valorVendaRapidaRange?.[0];
        const end = filter.valorVendaRapidaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorVendaRapida: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorVendaRapida: { lte: end },
          });
        }
      }
      if (filter?.valorLocacaoEstimadoRange?.length) {
        const start = filter.valorLocacaoEstimadoRange?.[0];
        const end = filter.valorLocacaoEstimadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorLocacaoEstimado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorLocacaoEstimado: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.validadeAteRange?.length) {
        const start = filter.validadeAteRange?.[0];
        const end = filter.validadeAteRange?.[1];

        if (start != null) {
          whereAnd.push({
            validadeAte: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            validadeAte: {
              lte: end,
            },
          });
        }
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.avaliador != null) {
        whereAnd.push({
          avaliador: {
            id: filter.avaliador,
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

      let avaliacoesImovel = await tx.avaliacaoImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          avaliador: true,
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

      const count = await tx.avaliacaoImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      avaliacoesImovel = await filePopulateDownloadUrlInTree(avaliacoesImovel);

      return { avaliacoesImovel, count };
    },
  );
}

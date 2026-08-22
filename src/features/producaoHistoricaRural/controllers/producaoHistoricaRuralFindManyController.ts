import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { producaoHistoricaRuralFindManyInputSchema } from '../producaoHistoricaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/producao-historica-rural',
  query: producaoHistoricaRuralFindManyInputSchema,
  response:
    '{ producoesHistoricasRurais: ProducaoHistoricaRural[], count: number }',
};

export const producaoHistoricaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_list',
  description: dictionary.producaoHistoricaRural.mcpDescription.list,
  requiredPermissions: { producaoHistoricaRural: ['read'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralFindManyController(params, context);
  },
});

export async function producaoHistoricaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    producaoHistoricaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ProducaoHistoricaRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.safraAno != null) {
        whereAnd.push({
          safraAno: { contains: filter?.safraAno, mode: 'insensitive' },
        });
      }
      if (filter?.atividade != null) {
        whereAnd.push({
          atividade: filter?.atividade,
        });
      }
      if (filter?.areaHaRange?.length) {
        const start = filter.areaHaRange?.[0];
        const end = filter.areaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaHa: { lte: end },
          });
        }
      }
      if (filter?.producaoTotalRange?.length) {
        const start = filter.producaoTotalRange?.[0];
        const end = filter.producaoTotalRange?.[1];

        if (start != null) {
          whereAnd.push({
            producaoTotal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            producaoTotal: { lte: end },
          });
        }
      }
      if (filter?.unidadeProducao != null) {
        whereAnd.push({
          unidadeProducao: {
            contains: filter?.unidadeProducao,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.produtividadePorHaRange?.length) {
        const start = filter.produtividadePorHaRange?.[0];
        const end = filter.produtividadePorHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            produtividadePorHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            produtividadePorHa: { lte: end },
          });
        }
      }
      if (filter?.cabecasMediaAnoRange?.length) {
        const start = filter.cabecasMediaAnoRange?.[0];
        const end = filter.cabecasMediaAnoRange?.[1];

        if (start != null) {
          whereAnd.push({
            cabecasMediaAno: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            cabecasMediaAno: { lte: end },
          });
        }
      }
      if (filter?.uaHaRange?.length) {
        const start = filter.uaHaRange?.[0];
        const end = filter.uaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            uaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            uaHa: { lte: end },
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

      let producoesHistoricasRurais = await tx.producaoHistoricaRural.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
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

      const count = await tx.producaoHistoricaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      producoesHistoricasRurais = await filePopulateDownloadUrlInTree(
        producoesHistoricasRurais,
      );

      return { producoesHistoricasRurais, count };
    },
  );
}

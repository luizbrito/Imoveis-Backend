import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { referenciaClimaticaRuralFindManyInputSchema } from '../referenciaClimaticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referencia-climatica-rural',
  query: referenciaClimaticaRuralFindManyInputSchema,
  response:
    '{ referenciasClimaticasRurais: ReferenciaClimaticaRural[], count: number }',
};

export const referenciaClimaticaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_list',
  description: dictionary.referenciaClimaticaRural.mcpDescription.list,
  requiredPermissions: { referenciaClimaticaRural: ['read'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralFindManyController(params, context);
  },
});

export async function referenciaClimaticaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    referenciaClimaticaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReferenciaClimaticaRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.tipoReferencia != null) {
        whereAnd.push({
          tipoReferencia: filter?.tipoReferencia,
        });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.pais != null) {
        whereAnd.push({
          pais: { contains: filter?.pais, mode: 'insensitive' },
        });
      }
      if (filter?.estadoDepartamentoProvincia != null) {
        whereAnd.push({
          estadoDepartamentoProvincia: {
            contains: filter?.estadoDepartamentoProvincia,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.municipioDistrito != null) {
        whereAnd.push({
          municipioDistrito: {
            contains: filter?.municipioDistrito,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.regiaoClimatica != null) {
        whereAnd.push({
          regiaoClimatica: {
            contains: filter?.regiaoClimatica,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.precipitacaoMediaAnualMmRange?.length) {
        const start = filter.precipitacaoMediaAnualMmRange?.[0];
        const end = filter.precipitacaoMediaAnualMmRange?.[1];

        if (start != null) {
          whereAnd.push({
            precipitacaoMediaAnualMm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            precipitacaoMediaAnualMm: { lte: end },
          });
        }
      }
      if (filter?.precipitacaoMinimaReferenciaMmRange?.length) {
        const start = filter.precipitacaoMinimaReferenciaMmRange?.[0];
        const end = filter.precipitacaoMinimaReferenciaMmRange?.[1];

        if (start != null) {
          whereAnd.push({
            precipitacaoMinimaReferenciaMm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            precipitacaoMinimaReferenciaMm: { lte: end },
          });
        }
      }
      if (filter?.precipitacaoMaximaReferenciaMmRange?.length) {
        const start = filter.precipitacaoMaximaReferenciaMmRange?.[0];
        const end = filter.precipitacaoMaximaReferenciaMmRange?.[1];

        if (start != null) {
          whereAnd.push({
            precipitacaoMaximaReferenciaMm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            precipitacaoMaximaReferenciaMm: { lte: end },
          });
        }
      }
      if (filter?.faixaPluviometrica != null) {
        whereAnd.push({
          faixaPluviometrica: {
            contains: filter?.faixaPluviometrica,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.mesMaisChuvoso != null) {
        whereAnd.push({
          mesMaisChuvoso: {
            contains: filter?.mesMaisChuvoso,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.mesMaisSeco != null) {
        whereAnd.push({
          mesMaisSeco: { contains: filter?.mesMaisSeco, mode: 'insensitive' },
        });
      }
      if (filter?.inicioPeriodoChuvoso != null) {
        whereAnd.push({
          inicioPeriodoChuvoso: {
            contains: filter?.inicioPeriodoChuvoso,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.fimPeriodoChuvoso != null) {
        whereAnd.push({
          fimPeriodoChuvoso: {
            contains: filter?.fimPeriodoChuvoso,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.diasChuvaAnoRange?.length) {
        const start = filter.diasChuvaAnoRange?.[0];
        const end = filter.diasChuvaAnoRange?.[1];

        if (start != null) {
          whereAnd.push({
            diasChuvaAno: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            diasChuvaAno: { lte: end },
          });
        }
      }
      if (filter?.temperaturaMediaAnualCRange?.length) {
        const start = filter.temperaturaMediaAnualCRange?.[0];
        const end = filter.temperaturaMediaAnualCRange?.[1];

        if (start != null) {
          whereAnd.push({
            temperaturaMediaAnualC: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            temperaturaMediaAnualC: { lte: end },
          });
        }
      }
      if (filter?.temperaturaMinimaMediaCRange?.length) {
        const start = filter.temperaturaMinimaMediaCRange?.[0];
        const end = filter.temperaturaMinimaMediaCRange?.[1];

        if (start != null) {
          whereAnd.push({
            temperaturaMinimaMediaC: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            temperaturaMinimaMediaC: { lte: end },
          });
        }
      }
      if (filter?.temperaturaMaximaMediaCRange?.length) {
        const start = filter.temperaturaMaximaMediaCRange?.[0];
        const end = filter.temperaturaMaximaMediaCRange?.[1];

        if (start != null) {
          whereAnd.push({
            temperaturaMaximaMediaC: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            temperaturaMaximaMediaC: { lte: end },
          });
        }
      }
      if (filter?.riscoSeca != null) {
        whereAnd.push({
          riscoSeca: filter?.riscoSeca,
        });
      }
      if (filter?.riscoEncharcamento != null) {
        whereAnd.push({
          riscoEncharcamento: filter?.riscoEncharcamento,
        });
      }
      if (filter?.riscoGeada != null) {
        whereAnd.push({
          riscoGeada: filter?.riscoGeada,
        });
      }
      if (filter?.indiceAridezRange?.length) {
        const start = filter.indiceAridezRange?.[0];
        const end = filter.indiceAridezRange?.[1];

        if (start != null) {
          whereAnd.push({
            indiceAridez: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            indiceAridez: { lte: end },
          });
        }
      }
      if (filter?.periodoClimatologicoInicioRange?.length) {
        const start = filter.periodoClimatologicoInicioRange?.[0];
        const end = filter.periodoClimatologicoInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            periodoClimatologicoInicio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            periodoClimatologicoInicio: { lte: end },
          });
        }
      }
      if (filter?.periodoClimatologicoFimRange?.length) {
        const start = filter.periodoClimatologicoFimRange?.[0];
        const end = filter.periodoClimatologicoFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            periodoClimatologicoFim: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            periodoClimatologicoFim: { lte: end },
          });
        }
      }
      if (filter?.estacaoMeteorologica != null) {
        whereAnd.push({
          estacaoMeteorologica: {
            contains: filter?.estacaoMeteorologica,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.distanciaEstacaoKmRange?.length) {
        const start = filter.distanciaEstacaoKmRange?.[0];
        const end = filter.distanciaEstacaoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaEstacaoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaEstacaoKm: { lte: end },
          });
        }
      }
      if (filter?.fonteDados != null) {
        whereAnd.push({
          fonteDados: { contains: filter?.fonteDados, mode: 'insensitive' },
        });
      }
      if (filter?.dataConsultaRange?.length) {
        const start = filter.dataConsultaRange?.[0];
        const end = filter.dataConsultaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataConsulta: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataConsulta: {
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

      let referenciasClimaticasRurais =
        await tx.referenciaClimaticaRural.findMany({
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

      const count = await tx.referenciaClimaticaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      referenciasClimaticasRurais = await filePopulateDownloadUrlInTree(
        referenciasClimaticasRurais,
      );

      return { referenciasClimaticasRurais, count };
    },
  );
}

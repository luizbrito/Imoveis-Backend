import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { soloImovelRuralFindManyInputSchema } from '../soloImovelRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const soloImovelRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solo-imovel-rural',
  query: soloImovelRuralFindManyInputSchema,
  response: '{ solosImoveisRurais: SoloImovelRural[], count: number }',
};

export const soloImovelRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_list',
  description: dictionary.soloImovelRural.mcpDescription.list,
  requiredPermissions: { soloImovelRural: ['read'] },
  schema: toMcpJsonSchema(soloImovelRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralFindManyController(params, context);
  },
});

export async function soloImovelRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    soloImovelRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SoloImovelRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nomeArea != null) {
        whereAnd.push({
          nomeArea: { contains: filter?.nomeArea, mode: 'insensitive' },
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
      if (filter?.percentualImovelRange?.length) {
        const start = filter.percentualImovelRange?.[0];
        const end = filter.percentualImovelRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualImovel: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualImovel: { lte: end },
          });
        }
      }
      if (filter?.profundidadeMediaCmRange?.length) {
        const start = filter.profundidadeMediaCmRange?.[0];
        const end = filter.profundidadeMediaCmRange?.[1];

        if (start != null) {
          whereAnd.push({
            profundidadeMediaCm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            profundidadeMediaCm: { lte: end },
          });
        }
      }
      if (filter?.declividadeMediaPercentualRange?.length) {
        const start = filter.declividadeMediaPercentualRange?.[0];
        const end = filter.declividadeMediaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            declividadeMediaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            declividadeMediaPercentual: { lte: end },
          });
        }
      }
      if (filter?.phMedioRange?.length) {
        const start = filter.phMedioRange?.[0];
        const end = filter.phMedioRange?.[1];

        if (start != null) {
          whereAnd.push({
            phMedio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            phMedio: { lte: end },
          });
        }
      }
      if (filter?.materiaOrganicaPercentualRange?.length) {
        const start = filter.materiaOrganicaPercentualRange?.[0];
        const end = filter.materiaOrganicaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            materiaOrganicaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            materiaOrganicaPercentual: { lte: end },
          });
        }
      }
      if (filter?.teorArgilaPercentualRange?.length) {
        const start = filter.teorArgilaPercentualRange?.[0];
        const end = filter.teorArgilaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            teorArgilaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            teorArgilaPercentual: { lte: end },
          });
        }
      }
      if (filter?.teorAreiaPercentualRange?.length) {
        const start = filter.teorAreiaPercentualRange?.[0];
        const end = filter.teorAreiaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            teorAreiaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            teorAreiaPercentual: { lte: end },
          });
        }
      }
      if (filter?.teorSiltePercentualRange?.length) {
        const start = filter.teorSiltePercentualRange?.[0];
        const end = filter.teorSiltePercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            teorSiltePercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            teorSiltePercentual: { lte: end },
          });
        }
      }
      if (filter?.capacidadeUso != null) {
        whereAnd.push({
          capacidadeUso: {
            contains: filter?.capacidadeUso,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.usoAtual != null) {
        whereAnd.push({
          usoAtual: { contains: filter?.usoAtual, mode: 'insensitive' },
        });
      }
      if (filter?.usoRecomendado != null) {
        whereAnd.push({
          usoRecomendado: {
            contains: filter?.usoRecomendado,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.necessitaCorrecao != null) {
        whereAnd.push({
          necessitaCorrecao: filter.necessitaCorrecao === 'true',
        });
      }
      if (filter?.analiseSoloDataRange?.length) {
        const start = filter.analiseSoloDataRange?.[0];
        const end = filter.analiseSoloDataRange?.[1];

        if (start != null) {
          whereAnd.push({
            analiseSoloData: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            analiseSoloData: {
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
      if (filter?.tipoSolo != null) {
        whereAnd.push({
          tipoSolo: {
            id: filter.tipoSolo,
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

      let solosImoveisRurais = await tx.soloImovelRural.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          tipoSolo: true,
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

      const count = await tx.soloImovelRural.count({
        where: {
          AND: whereAnd,
        },
      });

      solosImoveisRurais =
        await filePopulateDownloadUrlInTree(solosImoveisRurais);

      return { solosImoveisRurais, count };
    },
  );
}

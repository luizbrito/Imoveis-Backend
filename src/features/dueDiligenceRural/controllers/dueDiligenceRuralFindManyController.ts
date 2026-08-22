import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { dueDiligenceRuralFindManyInputSchema } from '../dueDiligenceRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/due-diligence-rural',
  query: dueDiligenceRuralFindManyInputSchema,
  response: '{ dueDiligencesRurais: DueDiligenceRural[], count: number }',
};

export const dueDiligenceRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_list',
  description: dictionary.dueDiligenceRural.mcpDescription.list,
  requiredPermissions: { dueDiligenceRural: ['read'] },
  schema: toMcpJsonSchema(dueDiligenceRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralFindManyController(params, context);
  },
});

export async function dueDiligenceRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    dueDiligenceRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DueDiligenceRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.dataAnaliseRange?.length) {
        const start = filter.dataAnaliseRange?.[0];
        const end = filter.dataAnaliseRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAnalise: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAnalise: {
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
      if (filter?.riscoFundiario != null) {
        whereAnd.push({
          riscoFundiario: filter?.riscoFundiario,
        });
      }
      if (filter?.riscoAmbiental != null) {
        whereAnd.push({
          riscoAmbiental: filter?.riscoAmbiental,
        });
      }
      if (filter?.riscoFiscal != null) {
        whereAnd.push({
          riscoFiscal: filter?.riscoFiscal,
        });
      }
      if (filter?.riscoTrabalhista != null) {
        whereAnd.push({
          riscoTrabalhista: filter?.riscoTrabalhista,
        });
      }
      if (filter?.riscoDocumental != null) {
        whereAnd.push({
          riscoDocumental: filter?.riscoDocumental,
        });
      }
      if (filter?.notaDocumentacaoRange?.length) {
        const start = filter.notaDocumentacaoRange?.[0];
        const end = filter.notaDocumentacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaDocumentacao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaDocumentacao: { lte: end },
          });
        }
      }
      if (filter?.notaInfraestruturaRange?.length) {
        const start = filter.notaInfraestruturaRange?.[0];
        const end = filter.notaInfraestruturaRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaInfraestrutura: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaInfraestrutura: { lte: end },
          });
        }
      }
      if (filter?.notaLogisticaRange?.length) {
        const start = filter.notaLogisticaRange?.[0];
        const end = filter.notaLogisticaRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaLogistica: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaLogistica: { lte: end },
          });
        }
      }
      if (filter?.notaRecursosHidricosRange?.length) {
        const start = filter.notaRecursosHidricosRange?.[0];
        const end = filter.notaRecursosHidricosRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaRecursosHidricos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaRecursosHidricos: { lte: end },
          });
        }
      }
      if (filter?.notaClimaRange?.length) {
        const start = filter.notaClimaRange?.[0];
        const end = filter.notaClimaRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaClima: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaClima: { lte: end },
          });
        }
      }
      if (filter?.notaSoloRange?.length) {
        const start = filter.notaSoloRange?.[0];
        const end = filter.notaSoloRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaSolo: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaSolo: { lte: end },
          });
        }
      }
      if (filter?.notaAptidaoAgricolaRange?.length) {
        const start = filter.notaAptidaoAgricolaRange?.[0];
        const end = filter.notaAptidaoAgricolaRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaAptidaoAgricola: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaAptidaoAgricola: { lte: end },
          });
        }
      }
      if (filter?.notaAptidaoPecuariaRange?.length) {
        const start = filter.notaAptidaoPecuariaRange?.[0];
        const end = filter.notaAptidaoPecuariaRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaAptidaoPecuaria: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaAptidaoPecuaria: { lte: end },
          });
        }
      }
      if (filter?.notaAmbientalRange?.length) {
        const start = filter.notaAmbientalRange?.[0];
        const end = filter.notaAmbientalRange?.[1];

        if (start != null) {
          whereAnd.push({
            notaAmbiental: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            notaAmbiental: { lte: end },
          });
        }
      }
      if (filter?.scoreGeralRange?.length) {
        const start = filter.scoreGeralRange?.[0];
        const end = filter.scoreGeralRange?.[1];

        if (start != null) {
          whereAnd.push({
            scoreGeral: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            scoreGeral: { lte: end },
          });
        }
      }
      if (filter?.classificacaoFinal != null) {
        whereAnd.push({
          classificacaoFinal: filter?.classificacaoFinal,
        });
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

      let dueDiligencesRurais = await tx.dueDiligenceRural.findMany({
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

      const count = await tx.dueDiligenceRural.count({
        where: {
          AND: whereAnd,
        },
      });

      dueDiligencesRurais =
        await filePopulateDownloadUrlInTree(dueDiligencesRurais);

      return { dueDiligencesRurais, count };
    },
  );
}

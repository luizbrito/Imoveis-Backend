import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { logisticaRuralFindManyInputSchema } from '../logisticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const logisticaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/logistica-rural',
  query: logisticaRuralFindManyInputSchema,
  response: '{ logisticasRurais: LogisticaRural[], count: number }',
};

export const logisticaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_list',
  description: dictionary.logisticaRural.mcpDescription.list,
  requiredPermissions: { logisticaRural: ['read'] },
  schema: toMcpJsonSchema(logisticaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralFindManyController(params, context);
  },
});

export async function logisticaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    logisticaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LogisticaRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.descricao != null) {
        whereAnd.push({
          descricao: { contains: filter?.descricao, mode: 'insensitive' },
        });
      }
      if (filter?.tipoAcessoPrincipal != null) {
        whereAnd.push({
          tipoAcessoPrincipal: filter?.tipoAcessoPrincipal,
        });
      }
      if (filter?.distanciaAsfaltoKmRange?.length) {
        const start = filter.distanciaAsfaltoKmRange?.[0];
        const end = filter.distanciaAsfaltoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaAsfaltoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaAsfaltoKm: { lte: end },
          });
        }
      }
      if (filter?.transitavelAnoTodo != null) {
        whereAnd.push({
          transitavelAnoTodo: filter.transitavelAnoTodo === 'true',
        });
      }
      if (filter?.restricaoEpocaChuva != null) {
        whereAnd.push({
          restricaoEpocaChuva: filter.restricaoEpocaChuva === 'true',
        });
      }
      if (filter?.acessoCaminhaoBitrem != null) {
        whereAnd.push({
          acessoCaminhaoBitrem: filter.acessoCaminhaoBitrem === 'true',
        });
      }
      if (filter?.acessoRodotrem != null) {
        whereAnd.push({
          acessoRodotrem: filter.acessoRodotrem === 'true',
        });
      }
      if (filter?.distanciaCidadeKmRange?.length) {
        const start = filter.distanciaCidadeKmRange?.[0];
        const end = filter.distanciaCidadeKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaCidadeKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaCidadeKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaSiloKmRange?.length) {
        const start = filter.distanciaSiloKmRange?.[0];
        const end = filter.distanciaSiloKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaSiloKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaSiloKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaFrigorificoKmRange?.length) {
        const start = filter.distanciaFrigorificoKmRange?.[0];
        const end = filter.distanciaFrigorificoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaFrigorificoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaFrigorificoKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaCooperativaKmRange?.length) {
        const start = filter.distanciaCooperativaKmRange?.[0];
        const end = filter.distanciaCooperativaKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaCooperativaKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaCooperativaKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaPortoKmRange?.length) {
        const start = filter.distanciaPortoKmRange?.[0];
        const end = filter.distanciaPortoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaPortoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaPortoKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaFerroviaKmRange?.length) {
        const start = filter.distanciaFerroviaKmRange?.[0];
        const end = filter.distanciaFerroviaKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaFerroviaKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaFerroviaKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaAeroportoKmRange?.length) {
        const start = filter.distanciaAeroportoKmRange?.[0];
        const end = filter.distanciaAeroportoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaAeroportoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaAeroportoKm: { lte: end },
          });
        }
      }
      if (filter?.distanciaRodoviaPrincipalKmRange?.length) {
        const start = filter.distanciaRodoviaPrincipalKmRange?.[0];
        const end = filter.distanciaRodoviaPrincipalKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            distanciaRodoviaPrincipalKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            distanciaRodoviaPrincipalKm: { lte: end },
          });
        }
      }
      if (filter?.pontesInternasRange?.length) {
        const start = filter.pontesInternasRange?.[0];
        const end = filter.pontesInternasRange?.[1];

        if (start != null) {
          whereAnd.push({
            pontesInternas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            pontesInternas: { lte: end },
          });
        }
      }
      if (filter?.estradasInternasKmRange?.length) {
        const start = filter.estradasInternasKmRange?.[0];
        const end = filter.estradasInternasKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            estradasInternasKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            estradasInternasKm: { lte: end },
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

      let logisticasRurais = await tx.logisticaRural.findMany({
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

      const count = await tx.logisticaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      logisticasRurais = await filePopulateDownloadUrlInTree(logisticasRurais);

      return { logisticasRurais, count };
    },
  );
}

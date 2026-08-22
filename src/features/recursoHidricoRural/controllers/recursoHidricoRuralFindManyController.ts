import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { recursoHidricoRuralFindManyInputSchema } from '../recursoHidricoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/recurso-hidrico-rural',
  query: recursoHidricoRuralFindManyInputSchema,
  response: '{ recursosHidricosRurais: RecursoHidricoRural[], count: number }',
};

export const recursoHidricoRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_list',
  description: dictionary.recursoHidricoRural.mcpDescription.list,
  requiredPermissions: { recursoHidricoRural: ['read'] },
  schema: toMcpJsonSchema(recursoHidricoRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralFindManyController(params, context);
  },
});

export async function recursoHidricoRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    recursoHidricoRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RecursoHidricoRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nome != null) {
        whereAnd.push({
          nome: { contains: filter?.nome, mode: 'insensitive' },
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.perene != null) {
        whereAnd.push({
          perene: filter.perene === 'true',
        });
      }
      if (filter?.navegavel != null) {
        whereAnd.push({
          navegavel: filter.navegavel === 'true',
        });
      }
      if (filter?.extensaoNaPropriedadeKmRange?.length) {
        const start = filter.extensaoNaPropriedadeKmRange?.[0];
        const end = filter.extensaoNaPropriedadeKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            extensaoNaPropriedadeKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            extensaoNaPropriedadeKm: { lte: end },
          });
        }
      }
      if (filter?.frentePropriedadeKmRange?.length) {
        const start = filter.frentePropriedadeKmRange?.[0];
        const end = filter.frentePropriedadeKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            frentePropriedadeKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            frentePropriedadeKm: { lte: end },
          });
        }
      }
      if (filter?.vazaoEstimadaRange?.length) {
        const start = filter.vazaoEstimadaRange?.[0];
        const end = filter.vazaoEstimadaRange?.[1];

        if (start != null) {
          whereAnd.push({
            vazaoEstimada: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            vazaoEstimada: { lte: end },
          });
        }
      }
      if (filter?.qualidadeAgua != null) {
        whereAnd.push({
          qualidadeAgua: filter?.qualidadeAgua,
        });
      }
      if (filter?.sazonalidade != null) {
        whereAnd.push({
          sazonalidade: filter?.sazonalidade,
        });
      }
      if (filter?.usoGado != null) {
        whereAnd.push({
          usoGado: filter.usoGado === 'true',
        });
      }
      if (filter?.usoIrrigacao != null) {
        whereAnd.push({
          usoIrrigacao: filter.usoIrrigacao === 'true',
        });
      }
      if (filter?.usoHumano != null) {
        whereAnd.push({
          usoHumano: filter.usoHumano === 'true',
        });
      }
      if (filter?.capacidadeAbastecimentoCabecasRange?.length) {
        const start = filter.capacidadeAbastecimentoCabecasRange?.[0];
        const end = filter.capacidadeAbastecimentoCabecasRange?.[1];

        if (start != null) {
          whereAnd.push({
            capacidadeAbastecimentoCabecas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            capacidadeAbastecimentoCabecas: { lte: end },
          });
        }
      }
      if (filter?.areaIrrigavelHaRange?.length) {
        const start = filter.areaIrrigavelHaRange?.[0];
        const end = filter.areaIrrigavelHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaIrrigavelHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaIrrigavelHa: { lte: end },
          });
        }
      }
      if (filter?.outorgaNecessaria != null) {
        whereAnd.push({
          outorgaNecessaria: filter.outorgaNecessaria === 'true',
        });
      }
      if (filter?.outorgaSituacao != null) {
        whereAnd.push({
          outorgaSituacao: filter?.outorgaSituacao,
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

      let recursosHidricosRurais = await tx.recursoHidricoRural.findMany({
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

      const count = await tx.recursoHidricoRural.count({
        where: {
          AND: whereAnd,
        },
      });

      recursosHidricosRurais = await filePopulateDownloadUrlInTree(
        recursosHidricosRurais,
      );

      return { recursosHidricosRurais, count };
    },
  );
}

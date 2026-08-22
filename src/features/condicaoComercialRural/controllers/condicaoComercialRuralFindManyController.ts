import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condicaoComercialRuralFindManyInputSchema } from '../condicaoComercialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-comercial-rural',
  query: condicaoComercialRuralFindManyInputSchema,
  response:
    '{ condicoesComerciaisRurais: CondicaoComercialRural[], count: number }',
};

export const condicaoComercialRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_list',
  description: dictionary.condicaoComercialRural.mcpDescription.list,
  requiredPermissions: { condicaoComercialRural: ['read'] },
  schema: toMcpJsonSchema(condicaoComercialRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralFindManyController(params, context);
  },
});

export async function condicaoComercialRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    condicaoComercialRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondicaoComercialRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.precoPorHaRange?.length) {
        const start = filter.precoPorHaRange?.[0];
        const end = filter.precoPorHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            precoPorHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            precoPorHa: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.valorTotalRange?.length) {
        const start = filter.valorTotalRange?.[0];
        const end = filter.valorTotalRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorTotal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorTotal: { lte: end },
          });
        }
      }
      if (filter?.aceitaParcelamento != null) {
        whereAnd.push({
          aceitaParcelamento: filter.aceitaParcelamento === 'true',
        });
      }
      if (filter?.percentualEntradaRange?.length) {
        const start = filter.percentualEntradaRange?.[0];
        const end = filter.percentualEntradaRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualEntrada: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualEntrada: { lte: end },
          });
        }
      }
      if (filter?.numeroParcelasRange?.length) {
        const start = filter.numeroParcelasRange?.[0];
        const end = filter.numeroParcelasRange?.[1];

        if (start != null) {
          whereAnd.push({
            numeroParcelas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            numeroParcelas: { lte: end },
          });
        }
      }
      if (filter?.aceitaPermuta != null) {
        whereAnd.push({
          aceitaPermuta: filter.aceitaPermuta === 'true',
        });
      }
      if (filter?.aceitaFinanciamento != null) {
        whereAnd.push({
          aceitaFinanciamento: filter.aceitaFinanciamento === 'true',
        });
      }
      if (filter?.comissaoImobiliariaPercentualRange?.length) {
        const start = filter.comissaoImobiliariaPercentualRange?.[0];
        const end = filter.comissaoImobiliariaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            comissaoImobiliariaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            comissaoImobiliariaPercentual: { lte: end },
          });
        }
      }
      if (filter?.comissaoCorretorPercentualRange?.length) {
        const start = filter.comissaoCorretorPercentualRange?.[0];
        const end = filter.comissaoCorretorPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            comissaoCorretorPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            comissaoCorretorPercentual: { lte: end },
          });
        }
      }
      if (filter?.exclusividade != null) {
        whereAnd.push({
          exclusividade: filter.exclusividade === 'true',
        });
      }
      if (filter?.dataInicioExclusividadeRange?.length) {
        const start = filter.dataInicioExclusividadeRange?.[0];
        const end = filter.dataInicioExclusividadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicioExclusividade: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicioExclusividade: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimExclusividadeRange?.length) {
        const start = filter.dataFimExclusividadeRange?.[0];
        const end = filter.dataFimExclusividadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFimExclusividade: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFimExclusividade: {
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

      let condicoesComerciaisRurais = await tx.condicaoComercialRural.findMany({
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

      const count = await tx.condicaoComercialRural.count({
        where: {
          AND: whereAnd,
        },
      });

      condicoesComerciaisRurais = await filePopulateDownloadUrlInTree(
        condicoesComerciaisRurais,
      );

      return { condicoesComerciaisRurais, count };
    },
  );
}

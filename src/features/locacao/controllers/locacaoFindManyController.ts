import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { locacaoFindManyInputSchema } from '../locacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const locacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/locacao',
  query: locacaoFindManyInputSchema,
  response: '{ locacoes: Locacao[], count: number }',
};

export const locacaoFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_list',
  description: dictionary.locacao.mcpDescription.list,
  requiredPermissions: { locacao: ['read'] },
  schema: toMcpJsonSchema(locacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await locacaoFindManyController(params, context);
  },
});

export async function locacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    locacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LocacaoWhereInput> = [];

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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
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
      if (filter?.valorAluguelRange?.length) {
        const start = filter.valorAluguelRange?.[0];
        const end = filter.valorAluguelRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorAluguel: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorAluguel: { lte: end },
          });
        }
      }
      if (filter?.valorCondominioRange?.length) {
        const start = filter.valorCondominioRange?.[0];
        const end = filter.valorCondominioRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorCondominio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorCondominio: { lte: end },
          });
        }
      }
      if (filter?.valorIptuMensalRange?.length) {
        const start = filter.valorIptuMensalRange?.[0];
        const end = filter.valorIptuMensalRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorIptuMensal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorIptuMensal: { lte: end },
          });
        }
      }
      if (filter?.taxaAdministracaoPercentualRange?.length) {
        const start = filter.taxaAdministracaoPercentualRange?.[0];
        const end = filter.taxaAdministracaoPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            taxaAdministracaoPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            taxaAdministracaoPercentual: { lte: end },
          });
        }
      }
      if (filter?.diaVencimentoRange?.length) {
        const start = filter.diaVencimentoRange?.[0];
        const end = filter.diaVencimentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            diaVencimento: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            diaVencimento: { lte: end },
          });
        }
      }
      if (filter?.indiceReajuste != null) {
        whereAnd.push({
          indiceReajuste: filter?.indiceReajuste,
        });
      }
      if (filter?.periodicidadeReajusteMesesRange?.length) {
        const start = filter.periodicidadeReajusteMesesRange?.[0];
        const end = filter.periodicidadeReajusteMesesRange?.[1];

        if (start != null) {
          whereAnd.push({
            periodicidadeReajusteMeses: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            periodicidadeReajusteMeses: { lte: end },
          });
        }
      }
      if (filter?.multaAtrasoPercentualRange?.length) {
        const start = filter.multaAtrasoPercentualRange?.[0];
        const end = filter.multaAtrasoPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            multaAtrasoPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            multaAtrasoPercentual: { lte: end },
          });
        }
      }
      if (filter?.jurosMesPercentualRange?.length) {
        const start = filter.jurosMesPercentualRange?.[0];
        const end = filter.jurosMesPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            jurosMesPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            jurosMesPercentual: { lte: end },
          });
        }
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
          },
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
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
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

      let locacoes = await tx.locacao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          proposta: true,
          imovel: true,
          proprietario: true,
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

      const count = await tx.locacao.count({
        where: {
          AND: whereAnd,
        },
      });

      locacoes = await filePopulateDownloadUrlInTree(locacoes);

      return { locacoes, count };
    },
  );
}

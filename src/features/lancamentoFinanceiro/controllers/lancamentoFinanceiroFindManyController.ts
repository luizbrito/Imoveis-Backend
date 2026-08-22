import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { lancamentoFinanceiroFindManyInputSchema } from '../lancamentoFinanceiroSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lancamento-financeiro',
  query: lancamentoFinanceiroFindManyInputSchema,
  response: '{ lancamentosFinanceiros: LancamentoFinanceiro[], count: number }',
};

export const lancamentoFinanceiroFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_list',
  description: dictionary.lancamentoFinanceiro.mcpDescription.list,
  requiredPermissions: { lancamentoFinanceiro: ['read'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroFindManyInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroFindManyController(params, context);
  },
});

export async function lancamentoFinanceiroFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    lancamentoFinanceiroFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LancamentoFinanceiroWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataCompetenciaRange?.length) {
        const start = filter.dataCompetenciaRange?.[0];
        const end = filter.dataCompetenciaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataCompetencia: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataCompetencia: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataVencimentoRange?.length) {
        const start = filter.dataVencimentoRange?.[0];
        const end = filter.dataVencimentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataVencimento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataVencimento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataRealizacaoRange?.length) {
        const start = filter.dataRealizacaoRange?.[0];
        const end = filter.dataRealizacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRealizacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRealizacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.valorRange?.length) {
        const start = filter.valorRange?.[0];
        const end = filter.valorRange?.[1];

        if (start != null) {
          whereAnd.push({
            valor: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valor: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.formaPagamento != null) {
        whereAnd.push({
          formaPagamento: filter?.formaPagamento,
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
          },
        });
      }
      if (filter?.contaFinanceira != null) {
        whereAnd.push({
          contaFinanceira: {
            id: filter.contaFinanceira,
          },
        });
      }
      if (filter?.categoriaFinanceira != null) {
        whereAnd.push({
          categoriaFinanceira: {
            id: filter.categoriaFinanceira,
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
      if (filter?.venda != null) {
        whereAnd.push({
          venda: {
            id: filter.venda,
          },
        });
      }
      if (filter?.locacao != null) {
        whereAnd.push({
          locacao: {
            id: filter.locacao,
          },
        });
      }
      if (filter?.cobrancaLocacao != null) {
        whereAnd.push({
          cobrancaLocacao: {
            id: filter.cobrancaLocacao,
          },
        });
      }
      if (filter?.repasseProprietario != null) {
        whereAnd.push({
          repasseProprietario: {
            id: filter.repasseProprietario,
          },
        });
      }
      if (filter?.comissao != null) {
        whereAnd.push({
          comissao: {
            id: filter.comissao,
          },
        });
      }
      if (filter?.despesaImovel != null) {
        whereAnd.push({
          despesaImovel: {
            id: filter.despesaImovel,
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

      let lancamentosFinanceiros = await tx.lancamentoFinanceiro.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          contaFinanceira: true,
          categoriaFinanceira: true,
          imovel: true,
          venda: true,
          locacao: true,
          cobrancaLocacao: true,
          repasseProprietario: true,
          comissao: true,
          despesaImovel: true,
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

      const count = await tx.lancamentoFinanceiro.count({
        where: {
          AND: whereAnd,
        },
      });

      lancamentosFinanceiros = await filePopulateDownloadUrlInTree(
        lancamentosFinanceiros,
      );

      return { lancamentosFinanceiros, count };
    },
  );
}

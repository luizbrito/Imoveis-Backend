import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { simulacaoFinanciamentoFindManyInputSchema } from '../simulacaoFinanciamentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/simulacao-financiamento',
  query: simulacaoFinanciamentoFindManyInputSchema,
  response:
    '{ simulacoesFinanciamento: SimulacaoFinanciamento[], count: number }',
};

export const simulacaoFinanciamentoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_list',
  description: dictionary.simulacaoFinanciamento.mcpDescription.list,
  requiredPermissions: { simulacaoFinanciamento: ['read'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoFindManyInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoFindManyController(params, context);
  },
});

export async function simulacaoFinanciamentoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    simulacaoFinanciamentoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SimulacaoFinanciamentoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.dataSimulacaoRange?.length) {
        const start = filter.dataSimulacaoRange?.[0];
        const end = filter.dataSimulacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataSimulacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataSimulacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.valorImovelRange?.length) {
        const start = filter.valorImovelRange?.[0];
        const end = filter.valorImovelRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorImovel: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorImovel: { lte: end },
          });
        }
      }
      if (filter?.valorEntradaRange?.length) {
        const start = filter.valorEntradaRange?.[0];
        const end = filter.valorEntradaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorEntrada: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorEntrada: { lte: end },
          });
        }
      }
      if (filter?.valorFinanciadoRange?.length) {
        const start = filter.valorFinanciadoRange?.[0];
        const end = filter.valorFinanciadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorFinanciado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorFinanciado: { lte: end },
          });
        }
      }
      if (filter?.prazoMesesRange?.length) {
        const start = filter.prazoMesesRange?.[0];
        const end = filter.prazoMesesRange?.[1];

        if (start != null) {
          whereAnd.push({
            prazoMeses: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            prazoMeses: { lte: end },
          });
        }
      }
      if (filter?.taxaJurosAnualRange?.length) {
        const start = filter.taxaJurosAnualRange?.[0];
        const end = filter.taxaJurosAnualRange?.[1];

        if (start != null) {
          whereAnd.push({
            taxaJurosAnual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            taxaJurosAnual: { lte: end },
          });
        }
      }
      if (filter?.sistemaAmortizacao != null) {
        whereAnd.push({
          sistemaAmortizacao: filter?.sistemaAmortizacao,
        });
      }
      if (filter?.valorParcelaInicialRange?.length) {
        const start = filter.valorParcelaInicialRange?.[0];
        const end = filter.valorParcelaInicialRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorParcelaInicial: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorParcelaInicial: { lte: end },
          });
        }
      }
      if (filter?.instituicaoFinanceira != null) {
        whereAnd.push({
          instituicaoFinanceira: {
            contains: filter?.instituicaoFinanceira,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
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
      if (filter?.proposta != null) {
        whereAnd.push({
          proposta: {
            id: filter.proposta,
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

      let simulacoesFinanciamento = await tx.simulacaoFinanciamento.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          cliente: true,
          imovel: true,
          proposta: true,
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

      const count = await tx.simulacaoFinanciamento.count({
        where: {
          AND: whereAnd,
        },
      });

      simulacoesFinanciamento = await filePopulateDownloadUrlInTree(
        simulacoesFinanciamento,
      );

      return { simulacoesFinanciamento, count };
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { despesaImovelFindManyInputSchema } from '../despesaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const despesaImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/despesa-imovel',
  query: despesaImovelFindManyInputSchema,
  response: '{ despesasImovel: DespesaImovel[], count: number }',
};

export const despesaImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_list',
  description: dictionary.despesaImovel.mcpDescription.list,
  requiredPermissions: { despesaImovel: ['read'] },
  schema: toMcpJsonSchema(despesaImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await despesaImovelFindManyController(params, context);
  },
});

export async function despesaImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    despesaImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DespesaImovelWhereInput> = [];

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
      if (filter?.categoria != null) {
        whereAnd.push({
          categoria: filter?.categoria,
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
      if (filter?.dataPagamentoRange?.length) {
        const start = filter.dataPagamentoRange?.[0];
        const end = filter.dataPagamentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataPagamento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataPagamento: {
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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.responsavelPagamento != null) {
        whereAnd.push({
          responsavelPagamento: filter?.responsavelPagamento,
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.fornecedor != null) {
        whereAnd.push({
          fornecedor: {
            id: filter.fornecedor,
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
      if (filter?.ordemServico != null) {
        whereAnd.push({
          ordemServico: {
            id: filter.ordemServico,
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

      let despesasImovel = await tx.despesaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          fornecedor: true,
          locacao: true,
          ordemServico: true,
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

      const count = await tx.despesaImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      despesasImovel = await filePopulateDownloadUrlInTree(despesasImovel);

      return { despesasImovel, count };
    },
  );
}

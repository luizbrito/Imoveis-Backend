import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { cobrancaLocacaoFindManyInputSchema } from '../cobrancaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cobranca-locacao',
  query: cobrancaLocacaoFindManyInputSchema,
  response: '{ cobrancasLocacao: CobrancaLocacao[], count: number }',
};

export const cobrancaLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_list',
  description: dictionary.cobrancaLocacao.mcpDescription.list,
  requiredPermissions: { cobrancaLocacao: ['read'] },
  schema: toMcpJsonSchema(cobrancaLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoFindManyController(params, context);
  },
});

export async function cobrancaLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    cobrancaLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CobrancaLocacaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.competencia != null) {
        whereAnd.push({
          competencia: { contains: filter?.competencia, mode: 'insensitive' },
        });
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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
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
      if (filter?.valorIptuRange?.length) {
        const start = filter.valorIptuRange?.[0];
        const end = filter.valorIptuRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorIptu: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorIptu: { lte: end },
          });
        }
      }
      if (filter?.valorSeguroRange?.length) {
        const start = filter.valorSeguroRange?.[0];
        const end = filter.valorSeguroRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorSeguro: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorSeguro: { lte: end },
          });
        }
      }
      if (filter?.valorMultaRange?.length) {
        const start = filter.valorMultaRange?.[0];
        const end = filter.valorMultaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorMulta: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorMulta: { lte: end },
          });
        }
      }
      if (filter?.valorJurosRange?.length) {
        const start = filter.valorJurosRange?.[0];
        const end = filter.valorJurosRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorJuros: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorJuros: { lte: end },
          });
        }
      }
      if (filter?.valorDescontosRange?.length) {
        const start = filter.valorDescontosRange?.[0];
        const end = filter.valorDescontosRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorDescontos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorDescontos: { lte: end },
          });
        }
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
      if (filter?.linhaDigitavel != null) {
        whereAnd.push({
          linhaDigitavel: {
            contains: filter?.linhaDigitavel,
            mode: 'insensitive',
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

      let cobrancasLocacao = await tx.cobrancaLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          locacao: true,
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

      const count = await tx.cobrancaLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      cobrancasLocacao = await filePopulateDownloadUrlInTree(cobrancasLocacao);

      return { cobrancasLocacao, count };
    },
  );
}

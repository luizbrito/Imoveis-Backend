import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pagamentoLocacaoFindManyInputSchema } from '../pagamentoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-locacao',
  query: pagamentoLocacaoFindManyInputSchema,
  response: '{ pagamentosLocacao: PagamentoLocacao[], count: number }',
};

export const pagamentoLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_list',
  description: dictionary.pagamentoLocacao.mcpDescription.list,
  requiredPermissions: { pagamentoLocacao: ['read'] },
  schema: toMcpJsonSchema(pagamentoLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoFindManyController(params, context);
  },
});

export async function pagamentoLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    pagamentoLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PagamentoLocacaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
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
      if (filter?.valorPagoRange?.length) {
        const start = filter.valorPagoRange?.[0];
        const end = filter.valorPagoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorPago: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorPago: { lte: end },
          });
        }
      }
      if (filter?.formaPagamento != null) {
        whereAnd.push({
          formaPagamento: filter?.formaPagamento,
        });
      }
      if (filter?.identificadorTransacao != null) {
        whereAnd.push({
          identificadorTransacao: {
            contains: filter?.identificadorTransacao,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.cobranca != null) {
        whereAnd.push({
          cobranca: {
            id: filter.cobranca,
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

      let pagamentosLocacao = await tx.pagamentoLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          cobranca: true,
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

      const count = await tx.pagamentoLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      pagamentosLocacao =
        await filePopulateDownloadUrlInTree(pagamentosLocacao);

      return { pagamentosLocacao, count };
    },
  );
}

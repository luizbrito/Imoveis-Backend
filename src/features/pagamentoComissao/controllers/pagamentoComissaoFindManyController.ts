import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pagamentoComissaoFindManyInputSchema } from '../pagamentoComissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const pagamentoComissaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-comissao',
  query: pagamentoComissaoFindManyInputSchema,
  response: '{ pagamentosComissao: PagamentoComissao[], count: number }',
};

export const pagamentoComissaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_list',
  description: dictionary.pagamentoComissao.mcpDescription.list,
  requiredPermissions: { pagamentoComissao: ['read'] },
  schema: toMcpJsonSchema(pagamentoComissaoFindManyInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoFindManyController(params, context);
  },
});

export async function pagamentoComissaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    pagamentoComissaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PagamentoComissaoWhereInput> = [];

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
      if (filter?.formaPagamento != null) {
        whereAnd.push({
          formaPagamento: filter?.formaPagamento,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.comissao != null) {
        whereAnd.push({
          comissao: {
            id: filter.comissao,
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

      let pagamentosComissao = await tx.pagamentoComissao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          comissao: true,
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

      const count = await tx.pagamentoComissao.count({
        where: {
          AND: whereAnd,
        },
      });

      pagamentosComissao =
        await filePopulateDownloadUrlInTree(pagamentosComissao);

      return { pagamentosComissao, count };
    },
  );
}

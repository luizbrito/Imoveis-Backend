import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { reajusteLocacaoFindManyInputSchema } from '../reajusteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const reajusteLocacaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reajuste-locacao',
  query: reajusteLocacaoFindManyInputSchema,
  response: '{ reajustesLocacao: ReajusteLocacao[], count: number }',
};

export const reajusteLocacaoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_list',
  description: dictionary.reajusteLocacao.mcpDescription.list,
  requiredPermissions: { reajusteLocacao: ['read'] },
  schema: toMcpJsonSchema(reajusteLocacaoFindManyInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoFindManyController(params, context);
  },
});

export async function reajusteLocacaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    reajusteLocacaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReajusteLocacaoWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.dataBaseRange?.length) {
        const start = filter.dataBaseRange?.[0];
        const end = filter.dataBaseRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataBase: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataBase: {
              lte: end,
            },
          });
        }
      }
      if (filter?.indice != null) {
        whereAnd.push({
          indice: filter?.indice,
        });
      }
      if (filter?.percentualRange?.length) {
        const start = filter.percentualRange?.[0];
        const end = filter.percentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentual: { lte: end },
          });
        }
      }
      if (filter?.valorAnteriorRange?.length) {
        const start = filter.valorAnteriorRange?.[0];
        const end = filter.valorAnteriorRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorAnterior: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorAnterior: { lte: end },
          });
        }
      }
      if (filter?.valorNovoRange?.length) {
        const start = filter.valorNovoRange?.[0];
        const end = filter.valorNovoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorNovo: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorNovo: { lte: end },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
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

      let reajustesLocacao = await tx.reajusteLocacao.findMany({
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

      const count = await tx.reajusteLocacao.count({
        where: {
          AND: whereAnd,
        },
      });

      reajustesLocacao = await filePopulateDownloadUrlInTree(reajustesLocacao);

      return { reajustesLocacao, count };
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { comissaoFindManyInputSchema } from '../comissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const comissaoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/comissao',
  query: comissaoFindManyInputSchema,
  response: '{ comissoes: Comissao[], count: number }',
};

export const comissaoFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'comissao_list',
  description: dictionary.comissao.mcpDescription.list,
  requiredPermissions: { comissao: ['read'] },
  schema: toMcpJsonSchema(comissaoFindManyInputSchema),
  handler: async (params, context) => {
    return await comissaoFindManyController(params, context);
  },
});

export async function comissaoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    comissaoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ComissaoWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.baseCalculoRange?.length) {
        const start = filter.baseCalculoRange?.[0];
        const end = filter.baseCalculoRange?.[1];

        if (start != null) {
          whereAnd.push({
            baseCalculo: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            baseCalculo: { lte: end },
          });
        }
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
      if (filter?.valorComissaoRange?.length) {
        const start = filter.valorComissaoRange?.[0];
        const end = filter.valorComissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorComissao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorComissao: { lte: end },
          });
        }
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

      let comissoes = await tx.comissao.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          venda: true,
          locacao: true,
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

      const count = await tx.comissao.count({
        where: {
          AND: whereAnd,
        },
      });

      comissoes = await filePopulateDownloadUrlInTree(comissoes);

      return { comissoes, count };
    },
  );
}

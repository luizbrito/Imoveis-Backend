import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { categoriaFinanceiraFindManyInputSchema } from '../categoriaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/categoria-financeira',
  query: categoriaFinanceiraFindManyInputSchema,
  response: '{ categoriasFinanceiras: CategoriaFinanceira[], count: number }',
};

export const categoriaFinanceiraFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_list',
  description: dictionary.categoriaFinanceira.mcpDescription.list,
  requiredPermissions: { categoriaFinanceira: ['read'] },
  schema: toMcpJsonSchema(categoriaFinanceiraFindManyInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraFindManyController(params, context);
  },
});

export async function categoriaFinanceiraFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    categoriaFinanceiraFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CategoriaFinanceiraWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nome != null) {
        whereAnd.push({
          nome: { contains: filter?.nome, mode: 'insensitive' },
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.grupo != null) {
        whereAnd.push({
          grupo: { contains: filter?.grupo, mode: 'insensitive' },
        });
      }
      if (filter?.codigoContabil != null) {
        whereAnd.push({
          codigoContabil: {
            contains: filter?.codigoContabil,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.ativa != null) {
        whereAnd.push({
          ativa: filter.ativa === 'true',
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

      let categoriasFinanceiras = await tx.categoriaFinanceira.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.categoriaFinanceira.count({
        where: {
          AND: whereAnd,
        },
      });

      categoriasFinanceiras = await filePopulateDownloadUrlInTree(
        categoriasFinanceiras,
      );

      return { categoriasFinanceiras, count };
    },
  );
}

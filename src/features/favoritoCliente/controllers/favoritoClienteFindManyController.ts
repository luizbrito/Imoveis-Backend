import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { favoritoClienteFindManyInputSchema } from '../favoritoClienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const favoritoClienteFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/favorito-cliente',
  query: favoritoClienteFindManyInputSchema,
  response: '{ favoritosCliente: FavoritoCliente[], count: number }',
};

export const favoritoClienteFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_list',
  description: dictionary.favoritoCliente.mcpDescription.list,
  requiredPermissions: { favoritoCliente: ['read'] },
  schema: toMcpJsonSchema(favoritoClienteFindManyInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteFindManyController(params, context);
  },
});

export async function favoritoClienteFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    favoritoClienteFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FavoritoClienteWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.dataInclusaoRange?.length) {
        const start = filter.dataInclusaoRange?.[0];
        const end = filter.dataInclusaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInclusao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInclusao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
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

      let favoritosCliente = await tx.favoritoCliente.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          cliente: true,
          imovel: true,
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

      const count = await tx.favoritoCliente.count({
        where: {
          AND: whereAnd,
        },
      });

      favoritosCliente = await filePopulateDownloadUrlInTree(favoritosCliente);

      return { favoritosCliente, count };
    },
  );
}

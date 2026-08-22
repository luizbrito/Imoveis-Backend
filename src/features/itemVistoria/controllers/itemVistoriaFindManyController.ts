import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { itemVistoriaFindManyInputSchema } from '../itemVistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const itemVistoriaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item-vistoria',
  query: itemVistoriaFindManyInputSchema,
  response: '{ itensVistoria: ItemVistoria[], count: number }',
};

export const itemVistoriaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'itemVistoria_list',
  description: dictionary.itemVistoria.mcpDescription.list,
  requiredPermissions: { itemVistoria: ['read'] },
  schema: toMcpJsonSchema(itemVistoriaFindManyInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaFindManyController(params, context);
  },
});

export async function itemVistoriaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    itemVistoriaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ItemVistoriaWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.ambiente != null) {
        whereAnd.push({
          ambiente: { contains: filter?.ambiente, mode: 'insensitive' },
        });
      }
      if (filter?.item != null) {
        whereAnd.push({
          item: { contains: filter?.item, mode: 'insensitive' },
        });
      }
      if (filter?.estado != null) {
        whereAnd.push({
          estado: filter?.estado,
        });
      }
      if (filter?.quantidadeRange?.length) {
        const start = filter.quantidadeRange?.[0];
        const end = filter.quantidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidade: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidade: { lte: end },
          });
        }
      }
      if (filter?.requerCorrecao != null) {
        whereAnd.push({
          requerCorrecao: filter.requerCorrecao === 'true',
        });
      }
      if (filter?.valorEstimadoCorrecaoRange?.length) {
        const start = filter.valorEstimadoCorrecaoRange?.[0];
        const end = filter.valorEstimadoCorrecaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorEstimadoCorrecao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorEstimadoCorrecao: { lte: end },
          });
        }
      }
      if (filter?.vistoria != null) {
        whereAnd.push({
          vistoria: {
            id: filter.vistoria,
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

      let itensVistoria = await tx.itemVistoria.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          vistoria: true,
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

      const count = await tx.itemVistoria.count({
        where: {
          AND: whereAnd,
        },
      });

      itensVistoria = await filePopulateDownloadUrlInTree(itensVistoria);

      return { itensVistoria, count };
    },
  );
}

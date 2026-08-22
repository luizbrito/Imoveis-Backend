import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { caracteristicaImovelFindManyInputSchema } from '../caracteristicaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const caracteristicaImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/caracteristica-imovel',
  query: caracteristicaImovelFindManyInputSchema,
  response: '{ caracteristicasImovel: CaracteristicaImovel[], count: number }',
};

export const caracteristicaImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_list',
  description: dictionary.caracteristicaImovel.mcpDescription.list,
  requiredPermissions: { caracteristicaImovel: ['read'] },
  schema: toMcpJsonSchema(caracteristicaImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelFindManyController(params, context);
  },
});

export async function caracteristicaImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    caracteristicaImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CaracteristicaImovelWhereInput> = [];

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
      if (filter?.grupo != null) {
        whereAnd.push({
          grupo: filter?.grupo,
        });
      }
      if (filter?.icone != null) {
        whereAnd.push({
          icone: { contains: filter?.icone, mode: 'insensitive' },
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

      let caracteristicasImovel = await tx.caracteristicaImovel.findMany({
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

      const count = await tx.caracteristicaImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      caracteristicasImovel = await filePopulateDownloadUrlInTree(
        caracteristicasImovel,
      );

      return { caracteristicasImovel, count };
    },
  );
}

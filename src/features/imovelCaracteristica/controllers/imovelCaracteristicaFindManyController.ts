import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { imovelCaracteristicaFindManyInputSchema } from '../imovelCaracteristicaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel-caracteristica',
  query: imovelCaracteristicaFindManyInputSchema,
  response: '{ imoveisCaracteristicas: ImovelCaracteristica[], count: number }',
};

export const imovelCaracteristicaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_list',
  description: dictionary.imovelCaracteristica.mcpDescription.list,
  requiredPermissions: { imovelCaracteristica: ['read'] },
  schema: toMcpJsonSchema(imovelCaracteristicaFindManyInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaFindManyController(params, context);
  },
});

export async function imovelCaracteristicaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    imovelCaracteristicaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ImovelCaracteristicaWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.valorTexto != null) {
        whereAnd.push({
          valorTexto: { contains: filter?.valorTexto, mode: 'insensitive' },
        });
      }
      if (filter?.destaque != null) {
        whereAnd.push({
          destaque: filter.destaque === 'true',
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
          },
        });
      }
      if (filter?.caracteristica != null) {
        whereAnd.push({
          caracteristica: {
            id: filter.caracteristica,
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

      let imoveisCaracteristicas = await tx.imovelCaracteristica.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
          caracteristica: true,
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

      const count = await tx.imovelCaracteristica.count({
        where: {
          AND: whereAnd,
        },
      });

      imoveisCaracteristicas = await filePopulateDownloadUrlInTree(
        imoveisCaracteristicas,
      );

      return { imoveisCaracteristicas, count };
    },
  );
}

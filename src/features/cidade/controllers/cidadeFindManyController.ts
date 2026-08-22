import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { cidadeFindManyInputSchema } from '../cidadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const cidadeFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cidade',
  query: cidadeFindManyInputSchema,
  response: '{ cidades: Cidade[], count: number }',
};

export const cidadeFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_list',
  description: dictionary.cidade.mcpDescription.list,
  requiredPermissions: { cidade: ['read'] },
  schema: toMcpJsonSchema(cidadeFindManyInputSchema),
  handler: async (params, context) => {
    return await cidadeFindManyController(params, context);
  },
});

export async function cidadeFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    cidadeFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CidadeWhereInput> = [];

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
      if (filter?.codigoOficial != null) {
        whereAnd.push({
          codigoOficial: {
            contains: filter?.codigoOficial,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.codigoPostal != null) {
        whereAnd.push({
          codigoPostal: { contains: filter?.codigoPostal, mode: 'insensitive' },
        });
      }
      if (filter?.latitudeRange?.length) {
        const start = filter.latitudeRange?.[0];
        const end = filter.latitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            latitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            latitude: { lte: end },
          });
        }
      }
      if (filter?.longitudeRange?.length) {
        const start = filter.longitudeRange?.[0];
        const end = filter.longitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            longitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            longitude: { lte: end },
          });
        }
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
        });
      }
      if (filter?.estado != null) {
        whereAnd.push({
          estado: {
            id: filter.estado,
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

      let cidades = await tx.cidade.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          estado: true,
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

      const count = await tx.cidade.count({
        where: {
          AND: whereAnd,
        },
      });

      cidades = await filePopulateDownloadUrlInTree(cidades);

      return { cidades, count };
    },
  );
}

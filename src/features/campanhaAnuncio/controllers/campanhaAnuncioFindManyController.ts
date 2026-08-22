import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { campanhaAnuncioFindManyInputSchema } from '../campanhaAnuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const campanhaAnuncioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-anuncio',
  query: campanhaAnuncioFindManyInputSchema,
  response: '{ campanhasAnuncios: CampanhaAnuncio[], count: number }',
};

export const campanhaAnuncioFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_list',
  description: dictionary.campanhaAnuncio.mcpDescription.list,
  requiredPermissions: { campanhaAnuncio: ['read'] },
  schema: toMcpJsonSchema(campanhaAnuncioFindManyInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioFindManyController(params, context);
  },
});

export async function campanhaAnuncioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    campanhaAnuncioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CampanhaAnuncioWhereInput> = [];

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
      if (filter?.investimentoAlocadoRange?.length) {
        const start = filter.investimentoAlocadoRange?.[0];
        const end = filter.investimentoAlocadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            investimentoAlocado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            investimentoAlocado: { lte: end },
          });
        }
      }
      if (filter?.impressoesRange?.length) {
        const start = filter.impressoesRange?.[0];
        const end = filter.impressoesRange?.[1];

        if (start != null) {
          whereAnd.push({
            impressoes: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            impressoes: { lte: end },
          });
        }
      }
      if (filter?.cliquesRange?.length) {
        const start = filter.cliquesRange?.[0];
        const end = filter.cliquesRange?.[1];

        if (start != null) {
          whereAnd.push({
            cliques: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            cliques: { lte: end },
          });
        }
      }
      if (filter?.leadsGeradosRange?.length) {
        const start = filter.leadsGeradosRange?.[0];
        const end = filter.leadsGeradosRange?.[1];

        if (start != null) {
          whereAnd.push({
            leadsGerados: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            leadsGerados: { lte: end },
          });
        }
      }
      if (filter?.campanha != null) {
        whereAnd.push({
          campanha: {
            id: filter.campanha,
          },
        });
      }
      if (filter?.anuncio != null) {
        whereAnd.push({
          anuncio: {
            id: filter.anuncio,
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

      let campanhasAnuncios = await tx.campanhaAnuncio.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          campanha: true,
          anuncio: true,
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

      const count = await tx.campanhaAnuncio.count({
        where: {
          AND: whereAnd,
        },
      });

      campanhasAnuncios =
        await filePopulateDownloadUrlInTree(campanhasAnuncios);

      return { campanhasAnuncios, count };
    },
  );
}

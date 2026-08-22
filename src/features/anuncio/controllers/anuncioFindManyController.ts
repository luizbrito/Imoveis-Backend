import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { anuncioFindManyInputSchema } from '../anuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const anuncioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/anuncio',
  query: anuncioFindManyInputSchema,
  response: '{ anuncios: Anuncio[], count: number }',
};

export const anuncioFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_list',
  description: dictionary.anuncio.mcpDescription.list,
  requiredPermissions: { anuncio: ['read'] },
  schema: toMcpJsonSchema(anuncioFindManyInputSchema),
  handler: async (params, context) => {
    return await anuncioFindManyController(params, context);
  },
});

export async function anuncioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    anuncioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AnuncioWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.slug != null) {
        whereAnd.push({
          slug: { contains: filter?.slug, mode: 'insensitive' },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataInicioRange?.length) {
        const start = filter.dataInicioRange?.[0];
        const end = filter.dataInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimRange?.length) {
        const start = filter.dataFimRange?.[0];
        const end = filter.dataFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFim: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFim: {
              lte: end,
            },
          });
        }
      }
      if (filter?.valorDivulgadoRange?.length) {
        const start = filter.valorDivulgadoRange?.[0];
        const end = filter.valorDivulgadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorDivulgado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorDivulgado: { lte: end },
          });
        }
      }
      if (filter?.tituloSeo != null) {
        whereAnd.push({
          tituloSeo: { contains: filter?.tituloSeo, mode: 'insensitive' },
        });
      }
      if (filter?.palavrasChave?.length) {
        whereAnd.push({
          palavrasChave: {
            hasSome: filter.palavrasChave,
          },
        });
      }
      if (filter?.destaque != null) {
        whereAnd.push({
          destaque: filter.destaque === 'true',
        });
      }
      if (filter?.aceitaContato != null) {
        whereAnd.push({
          aceitaContato: filter.aceitaContato === 'true',
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
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

      let anuncios = await tx.anuncio.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
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

      const count = await tx.anuncio.count({
        where: {
          AND: whereAnd,
        },
      });

      anuncios = await filePopulateDownloadUrlInTree(anuncios);

      return { anuncios, count };
    },
  );
}

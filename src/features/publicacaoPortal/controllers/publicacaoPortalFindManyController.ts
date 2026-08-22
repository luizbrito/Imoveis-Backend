import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { publicacaoPortalFindManyInputSchema } from '../publicacaoPortalSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const publicacaoPortalFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/publicacao-portal',
  query: publicacaoPortalFindManyInputSchema,
  response: '{ publicacoesPortal: PublicacaoPortal[], count: number }',
};

export const publicacaoPortalFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_list',
  description: dictionary.publicacaoPortal.mcpDescription.list,
  requiredPermissions: { publicacaoPortal: ['read'] },
  schema: toMcpJsonSchema(publicacaoPortalFindManyInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalFindManyController(params, context);
  },
});

export async function publicacaoPortalFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    publicacaoPortalFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PublicacaoPortalWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.codigoExterno != null) {
        whereAnd.push({
          codigoExterno: {
            contains: filter?.codigoExterno,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataEnvioRange?.length) {
        const start = filter.dataEnvioRange?.[0];
        const end = filter.dataEnvioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataEnvio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataEnvio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataAtualizacaoRange?.length) {
        const start = filter.dataAtualizacaoRange?.[0];
        const end = filter.dataAtualizacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAtualizacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAtualizacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.tentativasRange?.length) {
        const start = filter.tentativasRange?.[0];
        const end = filter.tentativasRange?.[1];

        if (start != null) {
          whereAnd.push({
            tentativas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            tentativas: { lte: end },
          });
        }
      }
      if (filter?.anuncio != null) {
        whereAnd.push({
          anuncio: {
            id: filter.anuncio,
          },
        });
      }
      if (filter?.portal != null) {
        whereAnd.push({
          portal: {
            id: filter.portal,
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

      let publicacoesPortal = await tx.publicacaoPortal.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          anuncio: true,
          portal: true,
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

      const count = await tx.publicacaoPortal.count({
        where: {
          AND: whereAnd,
        },
      });

      publicacoesPortal =
        await filePopulateDownloadUrlInTree(publicacoesPortal);

      return { publicacoesPortal, count };
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { midiaImovelFindManyInputSchema } from '../midiaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const midiaImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/midia-imovel',
  query: midiaImovelFindManyInputSchema,
  response: '{ midiasImovel: MidiaImovel[], count: number }',
};

export const midiaImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midiaImovel_list',
  description: dictionary.midiaImovel.mcpDescription.list,
  requiredPermissions: { midiaImovel: ['read'] },
  schema: toMcpJsonSchema(midiaImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await midiaImovelFindManyController(params, context);
  },
});

export async function midiaImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    midiaImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.MidiaImovelWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.ordemRange?.length) {
        const start = filter.ordemRange?.[0];
        const end = filter.ordemRange?.[1];

        if (start != null) {
          whereAnd.push({
            ordem: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            ordem: { lte: end },
          });
        }
      }
      if (filter?.principal != null) {
        whereAnd.push({
          principal: filter.principal === 'true',
        });
      }
      if (filter?.publica != null) {
        whereAnd.push({
          publica: filter.publica === 'true',
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

      let midiasImovel = await tx.midiaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.midiaImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      midiasImovel = await filePopulateDownloadUrlInTree(midiasImovel);

      return { midiasImovel, count };
    },
  );
}

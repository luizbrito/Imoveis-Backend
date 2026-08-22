import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { paisFindManyInputSchema } from '../paisSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const paisFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pais',
  query: paisFindManyInputSchema,
  response: '{ paiss: Pais[], count: number }',
};

export const paisFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_list',
  description: dictionary.pais.mcpDescription.list,
  requiredPermissions: { pais: ['read'] },
  schema: toMcpJsonSchema(paisFindManyInputSchema),
  handler: async (params, context) => {
    return await paisFindManyController(params, context);
  },
});

export async function paisFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } = paisFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PaisWhereInput> = [];

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
      if (filter?.sigla != null) {
        whereAnd.push({
          sigla: { contains: filter?.sigla, mode: 'insensitive' },
        });
      }
      if (filter?.codigoTelefone != null) {
        whereAnd.push({
          codigoTelefone: {
            contains: filter?.codigoTelefone,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.nacionalidade != null) {
        whereAnd.push({
          nacionalidade: {
            contains: filter?.nacionalidade,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
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

      let paiss = await tx.pais.findMany({
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

      const count = await tx.pais.count({
        where: {
          AND: whereAnd,
        },
      });

      paiss = await filePopulateDownloadUrlInTree(paiss);

      return { paiss, count };
    },
  );
}

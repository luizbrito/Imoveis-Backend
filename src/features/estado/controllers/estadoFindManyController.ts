import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { estadoFindManyInputSchema } from '../estadoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const estadoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/estado',
  query: estadoFindManyInputSchema,
  response: '{ estados: Estado[], count: number }',
};

export const estadoFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_list',
  description: dictionary.estado.mcpDescription.list,
  requiredPermissions: { estado: ['read'] },
  schema: toMcpJsonSchema(estadoFindManyInputSchema),
  handler: async (params, context) => {
    return await estadoFindManyController(params, context);
  },
});

export async function estadoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    estadoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.EstadoWhereInput> = [];

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
      if (filter?.codigoOficial != null) {
        whereAnd.push({
          codigoOficial: {
            contains: filter?.codigoOficial,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.tipoDivisao != null) {
        whereAnd.push({
          tipoDivisao: filter?.tipoDivisao,
        });
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
        });
      }
      if (filter?.pais != null) {
        whereAnd.push({
          pais: {
            id: filter.pais,
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

      let estados = await tx.estado.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          pais: true,
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

      const count = await tx.estado.count({
        where: {
          AND: whereAnd,
        },
      });

      estados = await filePopulateDownloadUrlInTree(estados);

      return { estados, count };
    },
  );
}

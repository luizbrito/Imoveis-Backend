import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { chaveImovelFindManyInputSchema } from '../chaveImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const chaveImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chave-imovel',
  query: chaveImovelFindManyInputSchema,
  response: '{ chavesImovel: ChaveImovel[], count: number }',
};

export const chaveImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chaveImovel_list',
  description: dictionary.chaveImovel.mcpDescription.list,
  requiredPermissions: { chaveImovel: ['read'] },
  schema: toMcpJsonSchema(chaveImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await chaveImovelFindManyController(params, context);
  },
});

export async function chaveImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    chaveImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ChaveImovelWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.localArmazenamento != null) {
        whereAnd.push({
          localArmazenamento: {
            contains: filter?.localArmazenamento,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.dataRetiradaRange?.length) {
        const start = filter.dataRetiradaRange?.[0];
        const end = filter.dataRetiradaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRetirada: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRetirada: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataPrevistaDevolucaoRange?.length) {
        const start = filter.dataPrevistaDevolucaoRange?.[0];
        const end = filter.dataPrevistaDevolucaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataPrevistaDevolucao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataPrevistaDevolucao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataDevolucaoRange?.length) {
        const start = filter.dataDevolucaoRange?.[0];
        const end = filter.dataDevolucaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataDevolucao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataDevolucao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.retiradaPor != null) {
        whereAnd.push({
          retiradaPor: { contains: filter?.retiradaPor, mode: 'insensitive' },
        });
      }
      if (filter?.telefoneRetirada != null) {
        whereAnd.push({
          telefoneRetirada: {
            contains: filter?.telefoneRetirada,
            mode: 'insensitive',
          },
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

      let chavesImovel = await tx.chaveImovel.findMany({
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

      const count = await tx.chaveImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      chavesImovel = await filePopulateDownloadUrlInTree(chavesImovel);

      return { chavesImovel, count };
    },
  );
}

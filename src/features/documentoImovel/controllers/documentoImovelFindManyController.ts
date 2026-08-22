import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentoImovelFindManyInputSchema } from '../documentoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const documentoImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-imovel',
  query: documentoImovelFindManyInputSchema,
  response: '{ documentosImovel: DocumentoImovel[], count: number }',
};

export const documentoImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_list',
  description: dictionary.documentoImovel.mcpDescription.list,
  requiredPermissions: { documentoImovel: ['read'] },
  schema: toMcpJsonSchema(documentoImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await documentoImovelFindManyController(params, context);
  },
});

export async function documentoImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    documentoImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentoImovelWhereInput> = [];

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
      if (filter?.numeroDocumento != null) {
        whereAnd.push({
          numeroDocumento: {
            contains: filter?.numeroDocumento,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.dataEmissaoRange?.length) {
        const start = filter.dataEmissaoRange?.[0];
        const end = filter.dataEmissaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataEmissao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataEmissao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataValidadeRange?.length) {
        const start = filter.dataValidadeRange?.[0];
        const end = filter.dataValidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataValidade: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataValidade: {
              lte: end,
            },
          });
        }
      }
      if (filter?.visibilidade != null) {
        whereAnd.push({
          visibilidade: filter?.visibilidade,
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

      let documentosImovel = await tx.documentoImovel.findMany({
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

      const count = await tx.documentoImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      documentosImovel = await filePopulateDownloadUrlInTree(documentosImovel);

      return { documentosImovel, count };
    },
  );
}

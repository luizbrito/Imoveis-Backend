import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { documentoPessoaFindManyInputSchema } from '../documentoPessoaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const documentoPessoaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-pessoa',
  query: documentoPessoaFindManyInputSchema,
  response: '{ documentosPessoas: DocumentoPessoa[], count: number }',
};

export const documentoPessoaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_list',
  description: dictionary.documentoPessoa.mcpDescription.list,
  requiredPermissions: { documentoPessoa: ['read'] },
  schema: toMcpJsonSchema(documentoPessoaFindManyInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaFindManyController(params, context);
  },
});

export async function documentoPessoaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    documentoPessoaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentoPessoaWhereInput> = [];

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
      if (filter?.numero != null) {
        whereAnd.push({
          numero: { contains: filter?.numero, mode: 'insensitive' },
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
      if (filter?.statusValidacao != null) {
        whereAnd.push({
          statusValidacao: filter?.statusValidacao,
        });
      }
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
          },
        });
      }
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
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

      let documentosPessoas = await tx.documentoPessoa.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          proprietario: true,
          cliente: true,
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

      const count = await tx.documentoPessoa.count({
        where: {
          AND: whereAnd,
        },
      });

      documentosPessoas =
        await filePopulateDownloadUrlInTree(documentosPessoas);

      return { documentosPessoas, count };
    },
  );
}

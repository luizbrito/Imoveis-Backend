import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { fornecedorFindManyInputSchema } from '../fornecedorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const fornecedorFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fornecedor',
  query: fornecedorFindManyInputSchema,
  response: '{ fornecedores: Fornecedor[], count: number }',
};

export const fornecedorFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'fornecedor_list',
  description: dictionary.fornecedor.mcpDescription.list,
  requiredPermissions: { fornecedor: ['read'] },
  schema: toMcpJsonSchema(fornecedorFindManyInputSchema),
  handler: async (params, context) => {
    return await fornecedorFindManyController(params, context);
  },
});

export async function fornecedorFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    fornecedorFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FornecedorWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nomeRazaoSocial != null) {
        whereAnd.push({
          nomeRazaoSocial: {
            contains: filter?.nomeRazaoSocial,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.tipoPessoa != null) {
        whereAnd.push({
          tipoPessoa: filter?.tipoPessoa,
        });
      }
      if (filter?.cpfCnpj != null) {
        whereAnd.push({
          cpfCnpj: { contains: filter?.cpfCnpj, mode: 'insensitive' },
        });
      }
      if (filter?.categorias?.length) {
        whereAnd.push({
          categorias: {
            hasSome: filter.categorias,
          },
        });
      }
      if (filter?.telefone != null) {
        whereAnd.push({
          telefone: { contains: filter?.telefone, mode: 'insensitive' },
        });
      }
      if (filter?.whatsapp != null) {
        whereAnd.push({
          whatsapp: { contains: filter?.whatsapp, mode: 'insensitive' },
        });
      }
      if (filter?.email != null) {
        whereAnd.push({
          email: { contains: filter?.email, mode: 'insensitive' },
        });
      }
      if (filter?.cidade != null) {
        whereAnd.push({
          cidade: { contains: filter?.cidade, mode: 'insensitive' },
        });
      }
      if (filter?.uf != null) {
        whereAnd.push({
          uf: filter?.uf,
        });
      }
      if (filter?.avaliacaoRange?.length) {
        const start = filter.avaliacaoRange?.[0];
        const end = filter.avaliacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            avaliacao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            avaliacao: { lte: end },
          });
        }
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
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

      let fornecedores = await tx.fornecedor.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
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

      const count = await tx.fornecedor.count({
        where: {
          AND: whereAnd,
        },
      });

      fornecedores = await filePopulateDownloadUrlInTree(fornecedores);

      return { fornecedores, count };
    },
  );
}

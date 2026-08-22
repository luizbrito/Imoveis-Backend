import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { filialFindManyInputSchema } from '../filialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const filialFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/filial',
  query: filialFindManyInputSchema,
  response: '{ filiais: Filial[], count: number }',
};

export const filialFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_list',
  description: dictionary.filial.mcpDescription.list,
  requiredPermissions: { filial: ['read'] },
  schema: toMcpJsonSchema(filialFindManyInputSchema),
  handler: async (params, context) => {
    return await filialFindManyController(params, context);
  },
});

export async function filialFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    filialFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FilialWhereInput> = [];

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
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.cnpj != null) {
        whereAnd.push({
          cnpj: { contains: filter?.cnpj, mode: 'insensitive' },
        });
      }
      if (filter?.telefone != null) {
        whereAnd.push({
          telefone: { contains: filter?.telefone, mode: 'insensitive' },
        });
      }
      if (filter?.email != null) {
        whereAnd.push({
          email: { contains: filter?.email, mode: 'insensitive' },
        });
      }
      if (filter?.logradouro != null) {
        whereAnd.push({
          logradouro: { contains: filter?.logradouro, mode: 'insensitive' },
        });
      }
      if (filter?.numero != null) {
        whereAnd.push({
          numero: { contains: filter?.numero, mode: 'insensitive' },
        });
      }
      if (filter?.bairro != null) {
        whereAnd.push({
          bairro: { contains: filter?.bairro, mode: 'insensitive' },
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
      if (filter?.cep != null) {
        whereAnd.push({
          cep: { contains: filter?.cep, mode: 'insensitive' },
        });
      }
      if (filter?.ativa != null) {
        whereAnd.push({
          ativa: filter.ativa === 'true',
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

      let filiais = await tx.filial.findMany({
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

      const count = await tx.filial.count({
        where: {
          AND: whereAnd,
        },
      });

      filiais = await filePopulateDownloadUrlInTree(filiais);

      return { filiais, count };
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { proprietarioFindManyInputSchema } from '../proprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const proprietarioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proprietario',
  query: proprietarioFindManyInputSchema,
  response: '{ proprietarios: Proprietario[], count: number }',
};

export const proprietarioFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_list',
  description: dictionary.proprietario.mcpDescription.list,
  requiredPermissions: { proprietario: ['read'] },
  schema: toMcpJsonSchema(proprietarioFindManyInputSchema),
  handler: async (params, context) => {
    return await proprietarioFindManyController(params, context);
  },
});

export async function proprietarioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    proprietarioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ProprietarioWhereInput> = [];

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
      if (filter?.rgInscricaoEstadual != null) {
        whereAnd.push({
          rgInscricaoEstadual: {
            contains: filter?.rgInscricaoEstadual,
            mode: 'insensitive',
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

      let proprietarios = await tx.proprietario.findMany({
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

      const count = await tx.proprietario.count({
        where: {
          AND: whereAnd,
        },
      });

      proprietarios = await filePopulateDownloadUrlInTree(proprietarios);

      return { proprietarios, count };
    },
  );
}

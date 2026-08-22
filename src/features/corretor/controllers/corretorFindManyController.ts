import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { corretorFindManyInputSchema } from '../corretorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const corretorFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/corretor',
  query: corretorFindManyInputSchema,
  response: '{ corretores: Corretor[], count: number }',
};

export const corretorFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_list',
  description: dictionary.corretor.mcpDescription.list,
  requiredPermissions: { corretor: ['read'] },
  schema: toMcpJsonSchema(corretorFindManyInputSchema),
  handler: async (params, context) => {
    return await corretorFindManyController(params, context);
  },
});

export async function corretorFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    corretorFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CorretorWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.nomeCompleto != null) {
        whereAnd.push({
          nomeCompleto: { contains: filter?.nomeCompleto, mode: 'insensitive' },
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
      if (filter?.creci != null) {
        whereAnd.push({
          creci: { contains: filter?.creci, mode: 'insensitive' },
        });
      }
      if (filter?.ufCreci != null) {
        whereAnd.push({
          ufCreci: filter?.ufCreci,
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
      if (filter?.percentualComissaoPadraoRange?.length) {
        const start = filter.percentualComissaoPadraoRange?.[0];
        const end = filter.percentualComissaoPadraoRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualComissaoPadrao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualComissaoPadrao: { lte: end },
          });
        }
      }
      if (filter?.especialidades?.length) {
        whereAnd.push({
          especialidades: {
            hasSome: filter.especialidades,
          },
        });
      }
      if (filter?.ativo != null) {
        whereAnd.push({
          ativo: filter.ativo === 'true',
        });
      }
      if (filter?.contaMembro != null) {
        whereAnd.push({
          contaMembro: {
            id: filter.contaMembro,
          },
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

      let corretores = await tx.corretor.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          contaMembro: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
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

      const count = await tx.corretor.count({
        where: {
          AND: whereAnd,
        },
      });

      corretores = await filePopulateDownloadUrlInTree(corretores);

      return { corretores, count };
    },
  );
}

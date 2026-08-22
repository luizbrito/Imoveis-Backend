import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { empreendimentoFindManyInputSchema } from '../empreendimentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const empreendimentoFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/empreendimento',
  query: empreendimentoFindManyInputSchema,
  response: '{ empreendimentos: Empreendimento[], count: number }',
};

export const empreendimentoFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_list',
  description: dictionary.empreendimento.mcpDescription.list,
  requiredPermissions: { empreendimento: ['read'] },
  schema: toMcpJsonSchema(empreendimentoFindManyInputSchema),
  handler: async (params, context) => {
    return await empreendimentoFindManyController(params, context);
  },
});

export async function empreendimentoFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    empreendimentoFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.EmpreendimentoWhereInput> = [];

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
      if (filter?.incorporadora != null) {
        whereAnd.push({
          incorporadora: {
            contains: filter?.incorporadora,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.construtora != null) {
        whereAnd.push({
          construtora: { contains: filter?.construtora, mode: 'insensitive' },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataLancamentoRange?.length) {
        const start = filter.dataLancamentoRange?.[0];
        const end = filter.dataLancamentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataLancamento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataLancamento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.previsaoEntregaRange?.length) {
        const start = filter.previsaoEntregaRange?.[0];
        const end = filter.previsaoEntregaRange?.[1];

        if (start != null) {
          whereAnd.push({
            previsaoEntrega: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            previsaoEntrega: {
              lte: end,
            },
          });
        }
      }
      if (filter?.cidade != null) {
        whereAnd.push({
          cidade: { contains: filter?.cidade, mode: 'insensitive' },
        });
      }
      if (filter?.bairro != null) {
        whereAnd.push({
          bairro: { contains: filter?.bairro, mode: 'insensitive' },
        });
      }
      if (filter?.endereco != null) {
        whereAnd.push({
          endereco: { contains: filter?.endereco, mode: 'insensitive' },
        });
      }
      if (filter?.diferenciais?.length) {
        whereAnd.push({
          diferenciais: {
            hasSome: filter.diferenciais,
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

      let empreendimentos = await tx.empreendimento.findMany({
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

      const count = await tx.empreendimento.count({
        where: {
          AND: whereAnd,
        },
      });

      empreendimentos = await filePopulateDownloadUrlInTree(empreendimentos);

      return { empreendimentos, count };
    },
  );
}

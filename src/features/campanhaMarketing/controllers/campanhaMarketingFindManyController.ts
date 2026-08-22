import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { campanhaMarketingFindManyInputSchema } from '../campanhaMarketingSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const campanhaMarketingFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-marketing',
  query: campanhaMarketingFindManyInputSchema,
  response: '{ campanhasMarketing: CampanhaMarketing[], count: number }',
};

export const campanhaMarketingFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_list',
  description: dictionary.campanhaMarketing.mcpDescription.list,
  requiredPermissions: { campanhaMarketing: ['read'] },
  schema: toMcpJsonSchema(campanhaMarketingFindManyInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingFindManyController(params, context);
  },
});

export async function campanhaMarketingFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    campanhaMarketingFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CampanhaMarketingWhereInput> = [];

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
      if (filter?.dataInicioRange?.length) {
        const start = filter.dataInicioRange?.[0];
        const end = filter.dataInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimRange?.length) {
        const start = filter.dataFimRange?.[0];
        const end = filter.dataFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFim: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFim: {
              lte: end,
            },
          });
        }
      }
      if (filter?.orcamentoRange?.length) {
        const start = filter.orcamentoRange?.[0];
        const end = filter.orcamentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            orcamento: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            orcamento: { lte: end },
          });
        }
      }
      if (filter?.custoRealRange?.length) {
        const start = filter.custoRealRange?.[0];
        const end = filter.custoRealRange?.[1];

        if (start != null) {
          whereAnd.push({
            custoReal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            custoReal: { lte: end },
          });
        }
      }
      if (filter?.quantidadeLeadsRange?.length) {
        const start = filter.quantidadeLeadsRange?.[0];
        const end = filter.quantidadeLeadsRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadeLeads: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadeLeads: { lte: end },
          });
        }
      }
      if (filter?.quantidadeConversoesRange?.length) {
        const start = filter.quantidadeConversoesRange?.[0];
        const end = filter.quantidadeConversoesRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidadeConversoes: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidadeConversoes: { lte: end },
          });
        }
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

      let campanhasMarketing = await tx.campanhaMarketing.findMany({
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

      const count = await tx.campanhaMarketing.count({
        where: {
          AND: whereAnd,
        },
      });

      campanhasMarketing =
        await filePopulateDownloadUrlInTree(campanhasMarketing);

      return { campanhasMarketing, count };
    },
  );
}

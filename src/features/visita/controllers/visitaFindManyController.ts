import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { visitaFindManyInputSchema } from '../visitaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const visitaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/visita',
  query: visitaFindManyInputSchema,
  response: '{ visitas: Visita[], count: number }',
};

export const visitaFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_list',
  description: dictionary.visita.mcpDescription.list,
  requiredPermissions: { visita: ['read'] },
  schema: toMcpJsonSchema(visitaFindManyInputSchema),
  handler: async (params, context) => {
    return await visitaFindManyController(params, context);
  },
});

export async function visitaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    visitaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VisitaWhereInput> = [];

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
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.pontoEncontro != null) {
        whereAnd.push({
          pontoEncontro: {
            contains: filter?.pontoEncontro,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.interessePosVisita != null) {
        whereAnd.push({
          interessePosVisita: filter?.interessePosVisita,
        });
      }
      if (filter?.lead != null) {
        whereAnd.push({
          lead: {
            id: filter.lead,
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
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
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

      let visitas = await tx.visita.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          lead: true,
          cliente: true,
          imovel: true,
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

      const count = await tx.visita.count({
        where: {
          AND: whereAnd,
        },
      });

      visitas = await filePopulateDownloadUrlInTree(visitas);

      return { visitas, count };
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { tarefaComercialFindManyInputSchema } from '../tarefaComercialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const tarefaComercialFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tarefa-comercial',
  query: tarefaComercialFindManyInputSchema,
  response: '{ tarefasComerciais: TarefaComercial[], count: number }',
};

export const tarefaComercialFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_list',
  description: dictionary.tarefaComercial.mcpDescription.list,
  requiredPermissions: { tarefaComercial: ['read'] },
  schema: toMcpJsonSchema(tarefaComercialFindManyInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialFindManyController(params, context);
  },
});

export async function tarefaComercialFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    tarefaComercialFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TarefaComercialWhereInput> = [];

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
      if (filter?.prioridade != null) {
        whereAnd.push({
          prioridade: filter?.prioridade,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataLimiteRange?.length) {
        const start = filter.dataLimiteRange?.[0];
        const end = filter.dataLimiteRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataLimite: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataLimite: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataConclusaoRange?.length) {
        const start = filter.dataConclusaoRange?.[0];
        const end = filter.dataConclusaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataConclusao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataConclusao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.lead != null) {
        whereAnd.push({
          lead: {
            id: filter.lead,
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
      if (filter?.cliente != null) {
        whereAnd.push({
          cliente: {
            id: filter.cliente,
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

      let tarefasComerciais = await tx.tarefaComercial.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          lead: true,
          corretor: true,
          cliente: true,
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

      const count = await tx.tarefaComercial.count({
        where: {
          AND: whereAnd,
        },
      });

      tarefasComerciais =
        await filePopulateDownloadUrlInTree(tarefasComerciais);

      return { tarefasComerciais, count };
    },
  );
}

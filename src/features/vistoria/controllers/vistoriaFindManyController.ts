import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { vistoriaFindManyInputSchema } from '../vistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const vistoriaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/vistoria',
  query: vistoriaFindManyInputSchema,
  response: '{ vistorias: Vistoria[], count: number }',
};

export const vistoriaFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_list',
  description: dictionary.vistoria.mcpDescription.list,
  requiredPermissions: { vistoria: ['read'] },
  schema: toMcpJsonSchema(vistoriaFindManyInputSchema),
  handler: async (params, context) => {
    return await vistoriaFindManyController(params, context);
  },
});

export async function vistoriaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    vistoriaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VistoriaWhereInput> = [];

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
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.dataAgendadaRange?.length) {
        const start = filter.dataAgendadaRange?.[0];
        const end = filter.dataAgendadaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataAgendada: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataAgendada: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataRealizadaRange?.length) {
        const start = filter.dataRealizadaRange?.[0];
        const end = filter.dataRealizadaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRealizada: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRealizada: {
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
      if (filter?.responsavelNome != null) {
        whereAnd.push({
          responsavelNome: {
            contains: filter?.responsavelNome,
            mode: 'insensitive',
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

      let vistorias = await tx.vistoria.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.vistoria.count({
        where: {
          AND: whereAnd,
        },
      });

      vistorias = await filePopulateDownloadUrlInTree(vistorias);

      return { vistorias, count };
    },
  );
}

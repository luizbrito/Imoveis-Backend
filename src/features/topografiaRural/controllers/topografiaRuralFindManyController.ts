import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { topografiaRuralFindManyInputSchema } from '../topografiaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const topografiaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/topografia-rural',
  query: topografiaRuralFindManyInputSchema,
  response: '{ topografiasRurais: TopografiaRural[], count: number }',
};

export const topografiaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_list',
  description: dictionary.topografiaRural.mcpDescription.list,
  requiredPermissions: { topografiaRural: ['read'] },
  schema: toMcpJsonSchema(topografiaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralFindManyController(params, context);
  },
});

export async function topografiaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    topografiaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TopografiaRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.descricao != null) {
        whereAnd.push({
          descricao: { contains: filter?.descricao, mode: 'insensitive' },
        });
      }
      if (filter?.tipoRelevo != null) {
        whereAnd.push({
          tipoRelevo: filter?.tipoRelevo,
        });
      }
      if (filter?.altitudeMinimaMRange?.length) {
        const start = filter.altitudeMinimaMRange?.[0];
        const end = filter.altitudeMinimaMRange?.[1];

        if (start != null) {
          whereAnd.push({
            altitudeMinimaM: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            altitudeMinimaM: { lte: end },
          });
        }
      }
      if (filter?.altitudeMaximaMRange?.length) {
        const start = filter.altitudeMaximaMRange?.[0];
        const end = filter.altitudeMaximaMRange?.[1];

        if (start != null) {
          whereAnd.push({
            altitudeMaximaM: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            altitudeMaximaM: { lte: end },
          });
        }
      }
      if (filter?.altitudeMediaMRange?.length) {
        const start = filter.altitudeMediaMRange?.[0];
        const end = filter.altitudeMediaMRange?.[1];

        if (start != null) {
          whereAnd.push({
            altitudeMediaM: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            altitudeMediaM: { lte: end },
          });
        }
      }
      if (filter?.declividadeMediaPercentualRange?.length) {
        const start = filter.declividadeMediaPercentualRange?.[0];
        const end = filter.declividadeMediaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            declividadeMediaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            declividadeMediaPercentual: { lte: end },
          });
        }
      }
      if (filter?.declividadeMaximaPercentualRange?.length) {
        const start = filter.declividadeMaximaPercentualRange?.[0];
        const end = filter.declividadeMaximaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            declividadeMaximaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            declividadeMaximaPercentual: { lte: end },
          });
        }
      }
      if (filter?.areaPlanaPercentualRange?.length) {
        const start = filter.areaPlanaPercentualRange?.[0];
        const end = filter.areaPlanaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaPlanaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaPlanaPercentual: { lte: end },
          });
        }
      }
      if (filter?.areaOnduladaPercentualRange?.length) {
        const start = filter.areaOnduladaPercentualRange?.[0];
        const end = filter.areaOnduladaPercentualRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaOnduladaPercentual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaOnduladaPercentual: { lte: end },
          });
        }
      }
      if (filter?.riscoErosao != null) {
        whereAnd.push({
          riscoErosao: filter?.riscoErosao,
        });
      }
      if (filter?.imovel != null) {
        whereAnd.push({
          imovel: {
            id: filter.imovel,
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

      let topografiasRurais = await tx.topografiaRural.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          imovel: true,
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

      const count = await tx.topografiaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      topografiasRurais =
        await filePopulateDownloadUrlInTree(topografiasRurais);

      return { topografiasRurais, count };
    },
  );
}

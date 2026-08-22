import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { restricaoTerritorialRuralFindManyInputSchema } from '../restricaoTerritorialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/restricao-territorial-rural',
  query: restricaoTerritorialRuralFindManyInputSchema,
  response:
    '{ restricoesTerritoriaisRurais: RestricaoTerritorialRural[], count: number }',
};

export const restricaoTerritorialRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_list',
  description: dictionary.restricaoTerritorialRural.mcpDescription.list,
  requiredPermissions: { restricaoTerritorialRural: ['read'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralFindManyController(params, context);
  },
});

export async function restricaoTerritorialRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    restricaoTerritorialRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RestricaoTerritorialRuralWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.areaAfetadaHaRange?.length) {
        const start = filter.areaAfetadaHaRange?.[0];
        const end = filter.areaAfetadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaAfetadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaAfetadaHa: { lte: end },
          });
        }
      }
      if (filter?.extensaoKmRange?.length) {
        const start = filter.extensaoKmRange?.[0];
        const end = filter.extensaoKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            extensaoKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            extensaoKm: { lte: end },
          });
        }
      }
      if (filter?.impacto != null) {
        whereAnd.push({
          impacto: filter?.impacto,
        });
      }
      if (filter?.regularizada != null) {
        whereAnd.push({
          regularizada: filter.regularizada === 'true',
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

      let restricoesTerritoriaisRurais =
        await tx.restricaoTerritorialRural.findMany({
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

      const count = await tx.restricaoTerritorialRural.count({
        where: {
          AND: whereAnd,
        },
      });

      restricoesTerritoriaisRurais = await filePopulateDownloadUrlInTree(
        restricoesTerritoriaisRurais,
      );

      return { restricoesTerritoriaisRurais, count };
    },
  );
}

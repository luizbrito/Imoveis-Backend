import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { benfeitoriaRuralFindManyInputSchema } from '../benfeitoriaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/benfeitoria-rural',
  query: benfeitoriaRuralFindManyInputSchema,
  response: '{ benfeitoriasRurais: BenfeitoriaRural[], count: number }',
};

export const benfeitoriaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_list',
  description: dictionary.benfeitoriaRural.mcpDescription.list,
  requiredPermissions: { benfeitoriaRural: ['read'] },
  schema: toMcpJsonSchema(benfeitoriaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralFindManyController(params, context);
  },
});

export async function benfeitoriaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    benfeitoriaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.BenfeitoriaRuralWhereInput> = [];

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
      if (filter?.quantidadeRange?.length) {
        const start = filter.quantidadeRange?.[0];
        const end = filter.quantidadeRange?.[1];

        if (start != null) {
          whereAnd.push({
            quantidade: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quantidade: { lte: end },
          });
        }
      }
      if (filter?.areaConstruidaM2Range?.length) {
        const start = filter.areaConstruidaM2Range?.[0];
        const end = filter.areaConstruidaM2Range?.[1];

        if (start != null) {
          whereAnd.push({
            areaConstruidaM2: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaConstruidaM2: { lte: end },
          });
        }
      }
      if (filter?.anoConstrucaoRange?.length) {
        const start = filter.anoConstrucaoRange?.[0];
        const end = filter.anoConstrucaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            anoConstrucao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            anoConstrucao: { lte: end },
          });
        }
      }
      if (filter?.estadoConservacao != null) {
        whereAnd.push({
          estadoConservacao: filter?.estadoConservacao,
        });
      }
      if (filter?.valorEstimadoRange?.length) {
        const start = filter.valorEstimadoRange?.[0];
        const end = filter.valorEstimadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorEstimado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorEstimado: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.incluidaVenda != null) {
        whereAnd.push({
          incluidaVenda: filter.incluidaVenda === 'true',
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

      let benfeitoriasRurais = await tx.benfeitoriaRural.findMany({
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

      const count = await tx.benfeitoriaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      benfeitoriasRurais =
        await filePopulateDownloadUrlInTree(benfeitoriasRurais);

      return { benfeitoriasRurais, count };
    },
  );
}

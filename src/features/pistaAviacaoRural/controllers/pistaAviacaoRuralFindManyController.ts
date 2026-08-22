import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { pistaAviacaoRuralFindManyInputSchema } from '../pistaAviacaoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pista-aviacao-rural',
  query: pistaAviacaoRuralFindManyInputSchema,
  response: '{ pistasAviacaoRurais: PistaAviacaoRural[], count: number }',
};

export const pistaAviacaoRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_list',
  description: dictionary.pistaAviacaoRural.mcpDescription.list,
  requiredPermissions: { pistaAviacaoRural: ['read'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralFindManyController(params, context);
  },
});

export async function pistaAviacaoRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    pistaAviacaoRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PistaAviacaoRuralWhereInput> = [];

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
      if (filter?.habilitada != null) {
        whereAnd.push({
          habilitada: filter.habilitada === 'true',
        });
      }
      if (filter?.situacaoHabilitacao != null) {
        whereAnd.push({
          situacaoHabilitacao: filter?.situacaoHabilitacao,
        });
      }
      if (filter?.comprimentoMRange?.length) {
        const start = filter.comprimentoMRange?.[0];
        const end = filter.comprimentoMRange?.[1];

        if (start != null) {
          whereAnd.push({
            comprimentoM: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            comprimentoM: { lte: end },
          });
        }
      }
      if (filter?.larguraMRange?.length) {
        const start = filter.larguraMRange?.[0];
        const end = filter.larguraMRange?.[1];

        if (start != null) {
          whereAnd.push({
            larguraM: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            larguraM: { lte: end },
          });
        }
      }
      if (filter?.tipoPiso != null) {
        whereAnd.push({
          tipoPiso: filter?.tipoPiso,
        });
      }
      if (filter?.orientacao != null) {
        whereAnd.push({
          orientacao: { contains: filter?.orientacao, mode: 'insensitive' },
        });
      }
      if (filter?.latitudeRange?.length) {
        const start = filter.latitudeRange?.[0];
        const end = filter.latitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            latitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            latitude: { lte: end },
          });
        }
      }
      if (filter?.longitudeRange?.length) {
        const start = filter.longitudeRange?.[0];
        const end = filter.longitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            longitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            longitude: { lte: end },
          });
        }
      }
      if (filter?.usoNoturno != null) {
        whereAnd.push({
          usoNoturno: filter.usoNoturno === 'true',
        });
      }
      if (filter?.hangar != null) {
        whereAnd.push({
          hangar: filter.hangar === 'true',
        });
      }
      if (filter?.combustivelDisponivel != null) {
        whereAnd.push({
          combustivelDisponivel: filter.combustivelDisponivel === 'true',
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

      let pistasAviacaoRurais = await tx.pistaAviacaoRural.findMany({
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

      const count = await tx.pistaAviacaoRural.count({
        where: {
          AND: whereAnd,
        },
      });

      pistasAviacaoRurais =
        await filePopulateDownloadUrlInTree(pistasAviacaoRurais);

      return { pistasAviacaoRurais, count };
    },
  );
}

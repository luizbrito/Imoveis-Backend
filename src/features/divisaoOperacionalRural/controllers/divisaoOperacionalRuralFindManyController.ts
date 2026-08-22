import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { divisaoOperacionalRuralFindManyInputSchema } from '../divisaoOperacionalRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/divisao-operacional-rural',
  query: divisaoOperacionalRuralFindManyInputSchema,
  response:
    '{ divisoesOperacionaisRurais: DivisaoOperacionalRural[], count: number }',
};

export const divisaoOperacionalRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_list',
  description: dictionary.divisaoOperacionalRural.mcpDescription.list,
  requiredPermissions: { divisaoOperacionalRural: ['read'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralFindManyController(params, context);
  },
});

export async function divisaoOperacionalRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    divisaoOperacionalRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DivisaoOperacionalRuralWhereInput> = [];

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
      if (filter?.areaHaRange?.length) {
        const start = filter.areaHaRange?.[0];
        const end = filter.areaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaHa: { lte: end },
          });
        }
      }
      if (filter?.usoAtual != null) {
        whereAnd.push({
          usoAtual: { contains: filter?.usoAtual, mode: 'insensitive' },
        });
      }
      if (filter?.capacidadeCabecasRange?.length) {
        const start = filter.capacidadeCabecasRange?.[0];
        const end = filter.capacidadeCabecasRange?.[1];

        if (start != null) {
          whereAnd.push({
            capacidadeCabecas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            capacidadeCabecas: { lte: end },
          });
        }
      }
      if (filter?.cercaTipo != null) {
        whereAnd.push({
          cercaTipo: { contains: filter?.cercaTipo, mode: 'insensitive' },
        });
      }
      if (filter?.cercaEstado != null) {
        whereAnd.push({
          cercaEstado: filter?.cercaEstado,
        });
      }
      if (filter?.bebedouro != null) {
        whereAnd.push({
          bebedouro: filter.bebedouro === 'true',
        });
      }
      if (filter?.cocho != null) {
        whereAnd.push({
          cocho: filter.cocho === 'true',
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

      let divisoesOperacionaisRurais =
        await tx.divisaoOperacionalRural.findMany({
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

      const count = await tx.divisaoOperacionalRural.count({
        where: {
          AND: whereAnd,
        },
      });

      divisoesOperacionaisRurais = await filePopulateDownloadUrlInTree(
        divisoesOperacionaisRurais,
      );

      return { divisoesOperacionaisRurais, count };
    },
  );
}

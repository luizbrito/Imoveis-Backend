import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ativoIncluidoVendaRuralFindManyInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ativo-incluido-venda-rural',
  query: ativoIncluidoVendaRuralFindManyInputSchema,
  response:
    '{ ativosIncluidosVendaRural: AtivoIncluidoVendaRural[], count: number }',
};

export const ativoIncluidoVendaRuralFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_list',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.list,
  requiredPermissions: { ativoIncluidoVendaRural: ['read'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralFindManyInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralFindManyController(params, context);
  },
});

export async function ativoIncluidoVendaRuralFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    ativoIncluidoVendaRuralFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AtivoIncluidoVendaRuralWhereInput> = [];

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
      if (filter?.incluidoPreco != null) {
        whereAnd.push({
          incluidoPreco: filter.incluidoPreco === 'true',
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

      let ativosIncluidosVendaRural = await tx.ativoIncluidoVendaRural.findMany(
        {
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
        },
      );

      const count = await tx.ativoIncluidoVendaRural.count({
        where: {
          AND: whereAnd,
        },
      });

      ativosIncluidosVendaRural = await filePopulateDownloadUrlInTree(
        ativosIncluidosVendaRural,
      );

      return { ativosIncluidosVendaRural, count };
    },
  );
}

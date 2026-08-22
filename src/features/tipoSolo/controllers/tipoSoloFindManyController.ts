import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { tipoSoloFindManyInputSchema } from '../tipoSoloSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const tipoSoloFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tipo-solo',
  query: tipoSoloFindManyInputSchema,
  response: '{ tiposSolo: TipoSolo[], count: number }',
};

export const tipoSoloFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_list',
  description: dictionary.tipoSolo.mcpDescription.list,
  requiredPermissions: { tipoSolo: ['read'] },
  schema: toMcpJsonSchema(tipoSoloFindManyInputSchema),
  handler: async (params, context) => {
    return await tipoSoloFindManyController(params, context);
  },
});

export async function tipoSoloFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    tipoSoloFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TipoSoloWhereInput> = [];

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
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.classeTextural != null) {
        whereAnd.push({
          classeTextural: filter?.classeTextural,
        });
      }
      if (filter?.origem != null) {
        whereAnd.push({
          origem: { contains: filter?.origem, mode: 'insensitive' },
        });
      }
      if (filter?.corPredominante != null) {
        whereAnd.push({
          corPredominante: {
            contains: filter?.corPredominante,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.drenagem != null) {
        whereAnd.push({
          drenagem: filter?.drenagem,
        });
      }
      if (filter?.fertilidadeNatural != null) {
        whereAnd.push({
          fertilidadeNatural: filter?.fertilidadeNatural,
        });
      }
      if (filter?.materiaOrganica != null) {
        whereAnd.push({
          materiaOrganica: filter?.materiaOrganica,
        });
      }
      if (filter?.acidez != null) {
        whereAnd.push({
          acidez: filter?.acidez,
        });
      }
      if (filter?.riscoErosao != null) {
        whereAnd.push({
          riscoErosao: filter?.riscoErosao,
        });
      }
      if (filter?.riscoCompactacao != null) {
        whereAnd.push({
          riscoCompactacao: filter?.riscoCompactacao,
        });
      }
      if (filter?.riscoEncharcamento != null) {
        whereAnd.push({
          riscoEncharcamento: filter?.riscoEncharcamento,
        });
      }
      if (filter?.aptidaoAgricola != null) {
        whereAnd.push({
          aptidaoAgricola: filter?.aptidaoAgricola,
        });
      }
      if (filter?.aptidaoPastagem != null) {
        whereAnd.push({
          aptidaoPastagem: filter?.aptidaoPastagem,
        });
      }
      if (filter?.aptidaoFlorestal != null) {
        whereAnd.push({
          aptidaoFlorestal: filter?.aptidaoFlorestal,
        });
      }
      if (filter?.fonteClassificacao != null) {
        whereAnd.push({
          fonteClassificacao: {
            contains: filter?.fonteClassificacao,
            mode: 'insensitive',
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

      let tiposSolo = await tx.tipoSolo.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
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

      const count = await tx.tipoSolo.count({
        where: {
          AND: whereAnd,
        },
      });

      tiposSolo = await filePopulateDownloadUrlInTree(tiposSolo);

      return { tiposSolo, count };
    },
  );
}

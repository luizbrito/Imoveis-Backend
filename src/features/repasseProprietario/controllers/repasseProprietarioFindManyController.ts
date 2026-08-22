import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { repasseProprietarioFindManyInputSchema } from '../repasseProprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const repasseProprietarioFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/repasse-proprietario',
  query: repasseProprietarioFindManyInputSchema,
  response: '{ repassesProprietario: RepasseProprietario[], count: number }',
};

export const repasseProprietarioFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_list',
  description: dictionary.repasseProprietario.mcpDescription.list,
  requiredPermissions: { repasseProprietario: ['read'] },
  schema: toMcpJsonSchema(repasseProprietarioFindManyInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioFindManyController(params, context);
  },
});

export async function repasseProprietarioFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    repasseProprietarioFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RepasseProprietarioWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.competencia != null) {
        whereAnd.push({
          competencia: { contains: filter?.competencia, mode: 'insensitive' },
        });
      }
      if (filter?.dataPrevistaRange?.length) {
        const start = filter.dataPrevistaRange?.[0];
        const end = filter.dataPrevistaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataPrevista: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataPrevista: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataRepasseRange?.length) {
        const start = filter.dataRepasseRange?.[0];
        const end = filter.dataRepasseRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataRepasse: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataRepasse: {
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
      if (filter?.valorRecebidoRange?.length) {
        const start = filter.valorRecebidoRange?.[0];
        const end = filter.valorRecebidoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorRecebido: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorRecebido: { lte: end },
          });
        }
      }
      if (filter?.taxaAdministracaoRange?.length) {
        const start = filter.taxaAdministracaoRange?.[0];
        const end = filter.taxaAdministracaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            taxaAdministracao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            taxaAdministracao: { lte: end },
          });
        }
      }
      if (filter?.despesasDescontadasRange?.length) {
        const start = filter.despesasDescontadasRange?.[0];
        const end = filter.despesasDescontadasRange?.[1];

        if (start != null) {
          whereAnd.push({
            despesasDescontadas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            despesasDescontadas: { lte: end },
          });
        }
      }
      if (filter?.impostosRetidosRange?.length) {
        const start = filter.impostosRetidosRange?.[0];
        const end = filter.impostosRetidosRange?.[1];

        if (start != null) {
          whereAnd.push({
            impostosRetidos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            impostosRetidos: { lte: end },
          });
        }
      }
      if (filter?.valorLiquidoRange?.length) {
        const start = filter.valorLiquidoRange?.[0];
        const end = filter.valorLiquidoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorLiquido: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorLiquido: { lte: end },
          });
        }
      }
      if (filter?.locacao != null) {
        whereAnd.push({
          locacao: {
            id: filter.locacao,
          },
        });
      }
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
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

      let repassesProprietario = await tx.repasseProprietario.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          locacao: true,
          proprietario: true,
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

      const count = await tx.repasseProprietario.count({
        where: {
          AND: whereAnd,
        },
      });

      repassesProprietario =
        await filePopulateDownloadUrlInTree(repassesProprietario);

      return { repassesProprietario, count };
    },
  );
}

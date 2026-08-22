import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { captacaoImovelFindManyInputSchema } from '../captacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const captacaoImovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/captacao-imovel',
  query: captacaoImovelFindManyInputSchema,
  response: '{ captacoesImovel: CaptacaoImovel[], count: number }',
};

export const captacaoImovelFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_list',
  description: dictionary.captacaoImovel.mcpDescription.list,
  requiredPermissions: { captacaoImovel: ['read'] },
  schema: toMcpJsonSchema(captacaoImovelFindManyInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelFindManyController(params, context);
  },
});

export async function captacaoImovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    captacaoImovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CaptacaoImovelWhereInput> = [];

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
      if (filter?.dataCaptacaoRange?.length) {
        const start = filter.dataCaptacaoRange?.[0];
        const end = filter.dataCaptacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataCaptacao: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataCaptacao: {
              lte: end,
            },
          });
        }
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataInicioRange?.length) {
        const start = filter.dataInicioRange?.[0];
        const end = filter.dataInicioRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataInicio: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataInicio: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataFimRange?.length) {
        const start = filter.dataFimRange?.[0];
        const end = filter.dataFimRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataFim: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataFim: {
              lte: end,
            },
          });
        }
      }
      if (filter?.percentualComissaoVendaRange?.length) {
        const start = filter.percentualComissaoVendaRange?.[0];
        const end = filter.percentualComissaoVendaRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualComissaoVenda: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualComissaoVenda: { lte: end },
          });
        }
      }
      if (filter?.percentualAdministracaoRange?.length) {
        const start = filter.percentualAdministracaoRange?.[0];
        const end = filter.percentualAdministracaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualAdministracao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualAdministracao: { lte: end },
          });
        }
      }
      if (filter?.valorMinimoAutorizadoRange?.length) {
        const start = filter.valorMinimoAutorizadoRange?.[0];
        const end = filter.valorMinimoAutorizadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorMinimoAutorizado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorMinimoAutorizado: { lte: end },
          });
        }
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
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
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
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

      let captacoesImovel = await tx.captacaoImovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          imovel: true,
          proprietario: true,
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

      const count = await tx.captacaoImovel.count({
        where: {
          AND: whereAnd,
        },
      });

      captacoesImovel = await filePopulateDownloadUrlInTree(captacoesImovel);

      return { captacoesImovel, count };
    },
  );
}

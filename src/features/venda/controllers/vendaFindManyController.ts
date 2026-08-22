import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { vendaFindManyInputSchema } from '../vendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const vendaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/venda',
  query: vendaFindManyInputSchema,
  response: '{ vendas: Venda[], count: number }',
};

export const vendaFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_list',
  description: dictionary.venda.mcpDescription.list,
  requiredPermissions: { venda: ['read'] },
  schema: toMcpJsonSchema(vendaFindManyInputSchema),
  handler: async (params, context) => {
    return await vendaFindManyController(params, context);
  },
});

export async function vendaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } = vendaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VendaWhereInput> = [];

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
      if (filter?.dataVendaRange?.length) {
        const start = filter.dataVendaRange?.[0];
        const end = filter.dataVendaRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataVenda: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataVenda: {
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
      if (filter?.valorVendaRange?.length) {
        const start = filter.valorVendaRange?.[0];
        const end = filter.valorVendaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorVenda: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorVenda: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.valorSinalRange?.length) {
        const start = filter.valorSinalRange?.[0];
        const end = filter.valorSinalRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorSinal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorSinal: { lte: end },
          });
        }
      }
      if (filter?.valorFinanciadoRange?.length) {
        const start = filter.valorFinanciadoRange?.[0];
        const end = filter.valorFinanciadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorFinanciado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorFinanciado: { lte: end },
          });
        }
      }
      if (filter?.valorPermutaRange?.length) {
        const start = filter.valorPermutaRange?.[0];
        const end = filter.valorPermutaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorPermuta: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorPermuta: { lte: end },
          });
        }
      }
      if (filter?.dataPrevisaoEscrituraRange?.length) {
        const start = filter.dataPrevisaoEscrituraRange?.[0];
        const end = filter.dataPrevisaoEscrituraRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataPrevisaoEscritura: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataPrevisaoEscritura: {
              lte: end,
            },
          });
        }
      }
      if (filter?.dataEscrituraRange?.length) {
        const start = filter.dataEscrituraRange?.[0];
        const end = filter.dataEscrituraRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataEscritura: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataEscritura: {
              lte: end,
            },
          });
        }
      }
      if (filter?.cartorio != null) {
        whereAnd.push({
          cartorio: { contains: filter?.cartorio, mode: 'insensitive' },
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
          },
        });
      }
      if (filter?.proposta != null) {
        whereAnd.push({
          proposta: {
            id: filter.proposta,
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
      if (filter?.comprador != null) {
        whereAnd.push({
          comprador: {
            id: filter.comprador,
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

      let vendas = await tx.venda.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          proposta: true,
          imovel: true,
          proprietario: true,
          comprador: true,
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

      const count = await tx.venda.count({
        where: {
          AND: whereAnd,
        },
      });

      vendas = await filePopulateDownloadUrlInTree(vendas);

      return { vendas, count };
    },
  );
}

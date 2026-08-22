import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { parcelaVendaFindManyInputSchema } from '../parcelaVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const parcelaVendaFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/parcela-venda',
  query: parcelaVendaFindManyInputSchema,
  response: '{ parcelasVenda: ParcelaVenda[], count: number }',
};

export const parcelaVendaFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcelaVenda_list',
  description: dictionary.parcelaVenda.mcpDescription.list,
  requiredPermissions: { parcelaVenda: ['read'] },
  schema: toMcpJsonSchema(parcelaVendaFindManyInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaFindManyController(params, context);
  },
});

export async function parcelaVendaFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    parcelaVendaFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ParcelaVendaWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.numeroParcelaRange?.length) {
        const start = filter.numeroParcelaRange?.[0];
        const end = filter.numeroParcelaRange?.[1];

        if (start != null) {
          whereAnd.push({
            numeroParcela: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            numeroParcela: { lte: end },
          });
        }
      }
      if (filter?.dataVencimentoRange?.length) {
        const start = filter.dataVencimentoRange?.[0];
        const end = filter.dataVencimentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataVencimento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataVencimento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.valorRange?.length) {
        const start = filter.valorRange?.[0];
        const end = filter.valorRange?.[1];

        if (start != null) {
          whereAnd.push({
            valor: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valor: { lte: end },
          });
        }
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.dataPagamentoRange?.length) {
        const start = filter.dataPagamentoRange?.[0];
        const end = filter.dataPagamentoRange?.[1];

        if (start != null) {
          whereAnd.push({
            dataPagamento: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            dataPagamento: {
              lte: end,
            },
          });
        }
      }
      if (filter?.valorPagoRange?.length) {
        const start = filter.valorPagoRange?.[0];
        const end = filter.valorPagoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorPago: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorPago: { lte: end },
          });
        }
      }
      if (filter?.formaPagamento != null) {
        whereAnd.push({
          formaPagamento: filter?.formaPagamento,
        });
      }
      if (filter?.venda != null) {
        whereAnd.push({
          venda: {
            id: filter.venda,
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

      let parcelasVenda = await tx.parcelaVenda.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          venda: true,
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

      const count = await tx.parcelaVenda.count({
        where: {
          AND: whereAnd,
        },
      });

      parcelasVenda = await filePopulateDownloadUrlInTree(parcelasVenda);

      return { parcelasVenda, count };
    },
  );
}

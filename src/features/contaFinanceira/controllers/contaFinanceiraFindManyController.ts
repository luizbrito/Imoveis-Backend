import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contaFinanceiraFindManyInputSchema } from '../contaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const contaFinanceiraFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/conta-financeira',
  query: contaFinanceiraFindManyInputSchema,
  response: '{ contasFinanceiras: ContaFinanceira[], count: number }',
};

export const contaFinanceiraFindManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_list',
  description: dictionary.contaFinanceira.mcpDescription.list,
  requiredPermissions: { contaFinanceira: ['read'] },
  schema: toMcpJsonSchema(contaFinanceiraFindManyInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraFindManyController(params, context);
  },
});

export async function contaFinanceiraFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    contaFinanceiraFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContaFinanceiraWhereInput> = [];

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
      if (filter?.banco != null) {
        whereAnd.push({
          banco: { contains: filter?.banco, mode: 'insensitive' },
        });
      }
      if (filter?.agencia != null) {
        whereAnd.push({
          agencia: { contains: filter?.agencia, mode: 'insensitive' },
        });
      }
      if (filter?.numeroConta != null) {
        whereAnd.push({
          numeroConta: { contains: filter?.numeroConta, mode: 'insensitive' },
        });
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.saldoInicialRange?.length) {
        const start = filter.saldoInicialRange?.[0];
        const end = filter.saldoInicialRange?.[1];

        if (start != null) {
          whereAnd.push({
            saldoInicial: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            saldoInicial: { lte: end },
          });
        }
      }
      if (filter?.ativa != null) {
        whereAnd.push({
          ativa: filter.ativa === 'true',
        });
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
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

      let contasFinanceiras = await tx.contaFinanceira.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
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

      const count = await tx.contaFinanceira.count({
        where: {
          AND: whereAnd,
        },
      });

      contasFinanceiras =
        await filePopulateDownloadUrlInTree(contasFinanceiras);

      return { contasFinanceiras, count };
    },
  );
}

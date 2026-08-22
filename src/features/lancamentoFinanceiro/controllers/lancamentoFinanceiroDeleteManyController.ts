import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { lancamentoFinanceiroDeleteManyInputSchema } from '../lancamentoFinanceiroSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/lancamento-financeiro',
  query: lancamentoFinanceiroDeleteManyInputSchema,
};

export const lancamentoFinanceiroDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_delete_many',
  description: dictionary.lancamentoFinanceiro.mcpDescription.delete,
  requiredPermissions: { lancamentoFinanceiro: ['delete'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroDeleteManyInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroDeleteManyController(params, context);
  },
});

export async function lancamentoFinanceiroDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['delete'],
    },
    context,
  );

  const { ids } = lancamentoFinanceiroDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const lancamentosFinanceirosToDelete =
        await tx.lancamentoFinanceiro.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            filial: {
              select: {
                id: true,
                nome: true,
              },
            },
            contaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            categoriaFinanceira: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            venda: {
              select: {
                id: true,
                codigo: true,
              },
            },
            locacao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            cobrancaLocacao: {
              select: {
                id: true,
                competencia: true,
              },
            },
            repasseProprietario: {
              select: {
                id: true,
                competencia: true,
              },
            },
            comissao: {
              select: {
                id: true,
                codigo: true,
              },
            },
            despesaImovel: {
              select: {
                id: true,
                descricao: true,
              },
            },
            createdByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            updatedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
            archivedByMember: {
              select: {
                id: true,
                fullName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        });

      const result = await tx.lancamentoFinanceiro.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const lancamentoFinanceiro of lancamentosFinanceirosToDelete) {
        await auditLogCreate({
          entityId: lancamentoFinanceiro.id,
          entityName: 'LancamentoFinanceiro',
          operation: auditLogOperations.delete,
          context,
          oldData: lancamentoFinanceiro,
          tx,
        });
      }

      return result;
    },
  );
}

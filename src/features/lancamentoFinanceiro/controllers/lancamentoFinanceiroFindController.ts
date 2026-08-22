import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { lancamentoFinanceiroFindSchema } from '../lancamentoFinanceiroSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lancamento-financeiro/{id}',
  params: lancamentoFinanceiroFindSchema,
  response: 'LancamentoFinanceiro',
};

export const lancamentoFinanceiroFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_get',
  description: dictionary.lancamentoFinanceiro.mcpDescription.get,
  requiredPermissions: { lancamentoFinanceiro: ['read'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroFindSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroFindController(params, context);
  },
});

export async function lancamentoFinanceiroFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['read'],
    },
    context,
  );

  const { id } = lancamentoFinanceiroFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let lancamentoFinanceiro = await tx.lancamentoFinanceiro.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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
          archivedByMember: {
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

      lancamentoFinanceiro =
        await filePopulateDownloadUrlInTree(lancamentoFinanceiro);

      return lancamentoFinanceiro;
    },
  );
}

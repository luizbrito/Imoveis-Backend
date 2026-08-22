import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoLocacaoFindSchema } from '../pagamentoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-locacao/{id}',
  params: pagamentoLocacaoFindSchema,
  response: 'PagamentoLocacao',
};

export const pagamentoLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_get',
  description: dictionary.pagamentoLocacao.mcpDescription.get,
  requiredPermissions: { pagamentoLocacao: ['read'] },
  schema: toMcpJsonSchema(pagamentoLocacaoFindSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoFindController(params, context);
  },
});

export async function pagamentoLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['read'],
    },
    context,
  );

  const { id } = pagamentoLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let pagamentoLocacao = await tx.pagamentoLocacao.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cobranca: {
            select: {
              id: true,
              competencia: true,
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

      pagamentoLocacao = await filePopulateDownloadUrlInTree(pagamentoLocacao);

      return pagamentoLocacao;
    },
  );
}

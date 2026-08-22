import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cobrancaLocacaoFindSchema } from '../cobrancaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cobranca-locacao/{id}',
  params: cobrancaLocacaoFindSchema,
  response: 'CobrancaLocacao',
};

export const cobrancaLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_get',
  description: dictionary.cobrancaLocacao.mcpDescription.get,
  requiredPermissions: { cobrancaLocacao: ['read'] },
  schema: toMcpJsonSchema(cobrancaLocacaoFindSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoFindController(params, context);
  },
});

export async function cobrancaLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['read'],
    },
    context,
  );

  const { id } = cobrancaLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let cobrancaLocacao = await tx.cobrancaLocacao.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          pagamentos: {
            select: {
              id: true,
              identificadorTransacao: true,
            },
          },
          lancamentosFinanceiros: {
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

      cobrancaLocacao = await filePopulateDownloadUrlInTree(cobrancaLocacao);

      return cobrancaLocacao;
    },
  );
}

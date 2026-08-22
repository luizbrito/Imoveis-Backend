import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoComissaoFindSchema } from '../pagamentoComissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-comissao/{id}',
  params: pagamentoComissaoFindSchema,
  response: 'PagamentoComissao',
};

export const pagamentoComissaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_get',
  description: dictionary.pagamentoComissao.mcpDescription.get,
  requiredPermissions: { pagamentoComissao: ['read'] },
  schema: toMcpJsonSchema(pagamentoComissaoFindSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoFindController(params, context);
  },
});

export async function pagamentoComissaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['read'],
    },
    context,
  );

  const { id } = pagamentoComissaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let pagamentoComissao = await tx.pagamentoComissao.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          comissao: {
            select: {
              id: true,
              codigo: true,
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

      pagamentoComissao =
        await filePopulateDownloadUrlInTree(pagamentoComissao);

      return pagamentoComissao;
    },
  );
}

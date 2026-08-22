import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { comissaoFindSchema } from '../comissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/comissao/{id}',
  params: comissaoFindSchema,
  response: 'Comissao',
};

export const comissaoFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'comissao_get',
  description: dictionary.comissao.mcpDescription.get,
  requiredPermissions: { comissao: ['read'] },
  schema: toMcpJsonSchema(comissaoFindSchema),
  handler: async (params, context) => {
    return await comissaoFindController(params, context);
  },
});

export async function comissaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['read'],
    },
    context,
  );

  const { id } = comissaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let comissao = await tx.comissao.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
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
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          pagamentos: {
            select: {
              id: true,
              dataPagamento: true,
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

      comissao = await filePopulateDownloadUrlInTree(comissao);

      return comissao;
    },
  );
}

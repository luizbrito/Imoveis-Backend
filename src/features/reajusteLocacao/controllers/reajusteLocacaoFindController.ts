import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reajusteLocacaoFindSchema } from '../reajusteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reajuste-locacao/{id}',
  params: reajusteLocacaoFindSchema,
  response: 'ReajusteLocacao',
};

export const reajusteLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_get',
  description: dictionary.reajusteLocacao.mcpDescription.get,
  requiredPermissions: { reajusteLocacao: ['read'] },
  schema: toMcpJsonSchema(reajusteLocacaoFindSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoFindController(params, context);
  },
});

export async function reajusteLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['read'],
    },
    context,
  );

  const { id } = reajusteLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let reajusteLocacao = await tx.reajusteLocacao.findUnique({
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

      reajusteLocacao = await filePopulateDownloadUrlInTree(reajusteLocacao);

      return reajusteLocacao;
    },
  );
}

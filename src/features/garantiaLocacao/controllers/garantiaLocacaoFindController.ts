import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { garantiaLocacaoFindSchema } from '../garantiaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/garantia-locacao/{id}',
  params: garantiaLocacaoFindSchema,
  response: 'GarantiaLocacao',
};

export const garantiaLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_get',
  description: dictionary.garantiaLocacao.mcpDescription.get,
  requiredPermissions: { garantiaLocacao: ['read'] },
  schema: toMcpJsonSchema(garantiaLocacaoFindSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoFindController(params, context);
  },
});

export async function garantiaLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['read'],
    },
    context,
  );

  const { id } = garantiaLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let garantiaLocacao = await tx.garantiaLocacao.findUnique({
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

      garantiaLocacao = await filePopulateDownloadUrlInTree(garantiaLocacao);

      return garantiaLocacao;
    },
  );
}

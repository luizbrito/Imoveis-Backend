import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoLocacaoFindSchema } from '../contratoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-locacao/{id}',
  params: contratoLocacaoFindSchema,
  response: 'ContratoLocacao',
};

export const contratoLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_get',
  description: dictionary.contratoLocacao.mcpDescription.get,
  requiredPermissions: { contratoLocacao: ['read'] },
  schema: toMcpJsonSchema(contratoLocacaoFindSchema),
  handler: async (params, context) => {
    return await contratoLocacaoFindController(params, context);
  },
});

export async function contratoLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['read'],
    },
    context,
  );

  const { id } = contratoLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let contratoLocacao = await tx.contratoLocacao.findUnique({
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

      contratoLocacao = await filePopulateDownloadUrlInTree(contratoLocacao);

      return contratoLocacao;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoContatoFindSchema } from '../solicitacaoContatoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-contato/{id}',
  params: solicitacaoContatoFindSchema,
  response: 'SolicitacaoContato',
};

export const solicitacaoContatoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_get',
  description: dictionary.solicitacaoContato.mcpDescription.get,
  requiredPermissions: { solicitacaoContato: ['read'] },
  schema: toMcpJsonSchema(solicitacaoContatoFindSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoFindController(params, context);
  },
});

export async function solicitacaoContatoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['read'],
    },
    context,
  );

  const { id } = solicitacaoContatoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let solicitacaoContato = await tx.solicitacaoContato.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
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

      solicitacaoContato =
        await filePopulateDownloadUrlInTree(solicitacaoContato);

      return solicitacaoContato;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoManutencaoFindSchema } from '../solicitacaoManutencaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-manutencao/{id}',
  params: solicitacaoManutencaoFindSchema,
  response: 'SolicitacaoManutencao',
};

export const solicitacaoManutencaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_get',
  description: dictionary.solicitacaoManutencao.mcpDescription.get,
  requiredPermissions: { solicitacaoManutencao: ['read'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoFindSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoFindController(params, context);
  },
});

export async function solicitacaoManutencaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['read'],
    },
    context,
  );

  const { id } = solicitacaoManutencaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let solicitacaoManutencao = await tx.solicitacaoManutencao.findUnique({
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          clienteSolicitante: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          ordensServico: {
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

      solicitacaoManutencao = await filePopulateDownloadUrlInTree(
        solicitacaoManutencao,
      );

      return solicitacaoManutencao;
    },
  );
}

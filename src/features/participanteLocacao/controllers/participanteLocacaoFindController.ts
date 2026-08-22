import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { participanteLocacaoFindSchema } from '../participanteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/participante-locacao/{id}',
  params: participanteLocacaoFindSchema,
  response: 'ParticipanteLocacao',
};

export const participanteLocacaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_get',
  description: dictionary.participanteLocacao.mcpDescription.get,
  requiredPermissions: { participanteLocacao: ['read'] },
  schema: toMcpJsonSchema(participanteLocacaoFindSchema),
  handler: async (params, context) => {
    return await participanteLocacaoFindController(params, context);
  },
});

export async function participanteLocacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['read'],
    },
    context,
  );

  const { id } = participanteLocacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let participanteLocacao = await tx.participanteLocacao.findUnique({
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
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      participanteLocacao =
        await filePopulateDownloadUrlInTree(participanteLocacao);

      return participanteLocacao;
    },
  );
}

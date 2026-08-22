import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoAdministracaoFindSchema } from '../contratoAdministracaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-administracao/{id}',
  params: contratoAdministracaoFindSchema,
  response: 'ContratoAdministracao',
};

export const contratoAdministracaoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_get',
  description: dictionary.contratoAdministracao.mcpDescription.get,
  requiredPermissions: { contratoAdministracao: ['read'] },
  schema: toMcpJsonSchema(contratoAdministracaoFindSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoFindController(params, context);
  },
});

export async function contratoAdministracaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['read'],
    },
    context,
  );

  const { id } = contratoAdministracaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let contratoAdministracao = await tx.contratoAdministracao.findUnique({
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
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
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

      contratoAdministracao = await filePopulateDownloadUrlInTree(
        contratoAdministracao,
      );

      return contratoAdministracao;
    },
  );
}

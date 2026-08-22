import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoPropostaFindSchema } from '../condicaoPropostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-proposta/{id}',
  params: condicaoPropostaFindSchema,
  response: 'CondicaoProposta',
};

export const condicaoPropostaFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_get',
  description: dictionary.condicaoProposta.mcpDescription.get,
  requiredPermissions: { condicaoProposta: ['read'] },
  schema: toMcpJsonSchema(condicaoPropostaFindSchema),
  handler: async (params, context) => {
    return await condicaoPropostaFindController(params, context);
  },
});

export async function condicaoPropostaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['read'],
    },
    context,
  );

  const { id } = condicaoPropostaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let condicaoProposta = await tx.condicaoProposta.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          proposta: {
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

      condicaoProposta = await filePopulateDownloadUrlInTree(condicaoProposta);

      return condicaoProposta;
    },
  );
}

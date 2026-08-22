import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { consentimentoLGPDFindSchema } from '../consentimentoLGPDSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/consentimento-l-g-p-d/{id}',
  params: consentimentoLGPDFindSchema,
  response: 'ConsentimentoLGPD',
};

export const consentimentoLGPDFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_get',
  description: dictionary.consentimentoLGPD.mcpDescription.get,
  requiredPermissions: { consentimentoLGPD: ['read'] },
  schema: toMcpJsonSchema(consentimentoLGPDFindSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDFindController(params, context);
  },
});

export async function consentimentoLGPDFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['read'],
    },
    context,
  );

  const { id } = consentimentoLGPDFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let consentimentoLGPD = await tx.consentimentoLGPD.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          lead: {
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

      consentimentoLGPD =
        await filePopulateDownloadUrlInTree(consentimentoLGPD);

      return consentimentoLGPD;
    },
  );
}

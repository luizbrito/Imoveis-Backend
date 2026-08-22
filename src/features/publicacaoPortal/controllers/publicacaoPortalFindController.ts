import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { publicacaoPortalFindSchema } from '../publicacaoPortalSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/publicacao-portal/{id}',
  params: publicacaoPortalFindSchema,
  response: 'PublicacaoPortal',
};

export const publicacaoPortalFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_get',
  description: dictionary.publicacaoPortal.mcpDescription.get,
  requiredPermissions: { publicacaoPortal: ['read'] },
  schema: toMcpJsonSchema(publicacaoPortalFindSchema),
  handler: async (params, context) => {
    return await publicacaoPortalFindController(params, context);
  },
});

export async function publicacaoPortalFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['read'],
    },
    context,
  );

  const { id } = publicacaoPortalFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let publicacaoPortal = await tx.publicacaoPortal.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          portal: {
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

      publicacaoPortal = await filePopulateDownloadUrlInTree(publicacaoPortal);

      return publicacaoPortal;
    },
  );
}

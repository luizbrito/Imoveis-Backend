import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { midiaImovelFindSchema } from '../midiaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/midia-imovel/{id}',
  params: midiaImovelFindSchema,
  response: 'MidiaImovel',
};

export const midiaImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'midiaImovel_get',
  description: dictionary.midiaImovel.mcpDescription.get,
  requiredPermissions: { midiaImovel: ['read'] },
  schema: toMcpJsonSchema(midiaImovelFindSchema),
  handler: async (params, context) => {
    return await midiaImovelFindController(params, context);
  },
});

export async function midiaImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['read'],
    },
    context,
  );

  const { id } = midiaImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let midiaImovel = await tx.midiaImovel.findUnique({
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

      midiaImovel = await filePopulateDownloadUrlInTree(midiaImovel);

      return midiaImovel;
    },
  );
}

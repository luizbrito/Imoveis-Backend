import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { topografiaRuralFindSchema } from '../topografiaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/topografia-rural/{id}',
  params: topografiaRuralFindSchema,
  response: 'TopografiaRural',
};

export const topografiaRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_get',
  description: dictionary.topografiaRural.mcpDescription.get,
  requiredPermissions: { topografiaRural: ['read'] },
  schema: toMcpJsonSchema(topografiaRuralFindSchema),
  handler: async (params, context) => {
    return await topografiaRuralFindController(params, context);
  },
});

export async function topografiaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['read'],
    },
    context,
  );

  const { id } = topografiaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let topografiaRural = await tx.topografiaRural.findUnique({
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

      topografiaRural = await filePopulateDownloadUrlInTree(topografiaRural);

      return topografiaRural;
    },
  );
}

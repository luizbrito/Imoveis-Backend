import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaMarketingFindSchema } from '../campanhaMarketingSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-marketing/{id}',
  params: campanhaMarketingFindSchema,
  response: 'CampanhaMarketing',
};

export const campanhaMarketingFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_get',
  description: dictionary.campanhaMarketing.mcpDescription.get,
  requiredPermissions: { campanhaMarketing: ['read'] },
  schema: toMcpJsonSchema(campanhaMarketingFindSchema),
  handler: async (params, context) => {
    return await campanhaMarketingFindController(params, context);
  },
});

export async function campanhaMarketingFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['read'],
    },
    context,
  );

  const { id } = campanhaMarketingFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let campanhaMarketing = await tx.campanhaMarketing.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          anunciosVinculados: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
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

      campanhaMarketing =
        await filePopulateDownloadUrlInTree(campanhaMarketing);

      return campanhaMarketing;
    },
  );
}

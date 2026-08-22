import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaAnuncioFindSchema } from '../campanhaAnuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-anuncio/{id}',
  params: campanhaAnuncioFindSchema,
  response: 'CampanhaAnuncio',
};

export const campanhaAnuncioFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_get',
  description: dictionary.campanhaAnuncio.mcpDescription.get,
  requiredPermissions: { campanhaAnuncio: ['read'] },
  schema: toMcpJsonSchema(campanhaAnuncioFindSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioFindController(params, context);
  },
});

export async function campanhaAnuncioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['read'],
    },
    context,
  );

  const { id } = campanhaAnuncioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let campanhaAnuncio = await tx.campanhaAnuncio.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          campanha: {
            select: {
              id: true,
              nome: true,
            },
          },
          anuncio: {
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

      campanhaAnuncio = await filePopulateDownloadUrlInTree(campanhaAnuncio);

      return campanhaAnuncio;
    },
  );
}

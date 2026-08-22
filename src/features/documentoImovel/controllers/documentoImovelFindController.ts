import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoImovelFindSchema } from '../documentoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-imovel/{id}',
  params: documentoImovelFindSchema,
  response: 'DocumentoImovel',
};

export const documentoImovelFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_get',
  description: dictionary.documentoImovel.mcpDescription.get,
  requiredPermissions: { documentoImovel: ['read'] },
  schema: toMcpJsonSchema(documentoImovelFindSchema),
  handler: async (params, context) => {
    return await documentoImovelFindController(params, context);
  },
});

export async function documentoImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['read'],
    },
    context,
  );

  const { id } = documentoImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let documentoImovel = await tx.documentoImovel.findUnique({
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

      documentoImovel = await filePopulateDownloadUrlInTree(documentoImovel);

      return documentoImovel;
    },
  );
}

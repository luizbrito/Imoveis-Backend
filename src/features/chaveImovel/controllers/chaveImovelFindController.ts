import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { chaveImovelFindSchema } from '../chaveImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chave-imovel/{id}',
  params: chaveImovelFindSchema,
  response: 'ChaveImovel',
};

export const chaveImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'chaveImovel_get',
  description: dictionary.chaveImovel.mcpDescription.get,
  requiredPermissions: { chaveImovel: ['read'] },
  schema: toMcpJsonSchema(chaveImovelFindSchema),
  handler: async (params, context) => {
    return await chaveImovelFindController(params, context);
  },
});

export async function chaveImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['read'],
    },
    context,
  );

  const { id } = chaveImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let chaveImovel = await tx.chaveImovel.findUnique({
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

      chaveImovel = await filePopulateDownloadUrlInTree(chaveImovel);

      return chaveImovel;
    },
  );
}

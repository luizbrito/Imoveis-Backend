import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { seguroImovelFindSchema } from '../seguroImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/seguro-imovel/{id}',
  params: seguroImovelFindSchema,
  response: 'SeguroImovel',
};

export const seguroImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'seguroImovel_get',
  description: dictionary.seguroImovel.mcpDescription.get,
  requiredPermissions: { seguroImovel: ['read'] },
  schema: toMcpJsonSchema(seguroImovelFindSchema),
  handler: async (params, context) => {
    return await seguroImovelFindController(params, context);
  },
});

export async function seguroImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['read'],
    },
    context,
  );

  const { id } = seguroImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let seguroImovel = await tx.seguroImovel.findUnique({
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
          locacao: {
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

      seguroImovel = await filePopulateDownloadUrlInTree(seguroImovel);

      return seguroImovel;
    },
  );
}

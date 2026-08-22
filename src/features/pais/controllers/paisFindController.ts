import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { paisFindSchema } from '../paisSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pais/{id}',
  params: paisFindSchema,
  response: 'Pais',
};

export const paisFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_get',
  description: dictionary.pais.mcpDescription.get,
  requiredPermissions: { pais: ['read'] },
  schema: toMcpJsonSchema(paisFindSchema),
  handler: async (params, context) => {
    return await paisFindController(params, context);
  },
});

export async function paisFindController(params: unknown, context: AppContext) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['read'],
    },
    context,
  );

  const { id } = paisFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let pais = await tx.pais.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          estados: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisPais: {
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

      pais = await filePopulateDownloadUrlInTree(pais);

      return pais;
    },
  );
}

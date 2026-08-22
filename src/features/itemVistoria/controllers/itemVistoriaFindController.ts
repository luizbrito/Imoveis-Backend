import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { itemVistoriaFindSchema } from '../itemVistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item-vistoria/{id}',
  params: itemVistoriaFindSchema,
  response: 'ItemVistoria',
};

export const itemVistoriaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'itemVistoria_get',
  description: dictionary.itemVistoria.mcpDescription.get,
  requiredPermissions: { itemVistoria: ['read'] },
  schema: toMcpJsonSchema(itemVistoriaFindSchema),
  handler: async (params, context) => {
    return await itemVistoriaFindController(params, context);
  },
});

export async function itemVistoriaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['read'],
    },
    context,
  );

  const { id } = itemVistoriaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let itemVistoria = await tx.itemVistoria.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          vistoria: {
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

      itemVistoria = await filePopulateDownloadUrlInTree(itemVistoria);

      return itemVistoria;
    },
  );
}

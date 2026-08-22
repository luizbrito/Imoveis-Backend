import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelCaracteristicaFindSchema } from '../imovelCaracteristicaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel-caracteristica/{id}',
  params: imovelCaracteristicaFindSchema,
  response: 'ImovelCaracteristica',
};

export const imovelCaracteristicaFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_get',
  description: dictionary.imovelCaracteristica.mcpDescription.get,
  requiredPermissions: { imovelCaracteristica: ['read'] },
  schema: toMcpJsonSchema(imovelCaracteristicaFindSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaFindController(params, context);
  },
});

export async function imovelCaracteristicaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['read'],
    },
    context,
  );

  const { id } = imovelCaracteristicaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let imovelCaracteristica = await tx.imovelCaracteristica.findUnique({
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
          caracteristica: {
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

      imovelCaracteristica =
        await filePopulateDownloadUrlInTree(imovelCaracteristica);

      return imovelCaracteristica;
    },
  );
}

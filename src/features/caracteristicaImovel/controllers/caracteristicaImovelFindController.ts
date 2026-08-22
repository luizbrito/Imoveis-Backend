import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { caracteristicaImovelFindSchema } from '../caracteristicaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/caracteristica-imovel/{id}',
  params: caracteristicaImovelFindSchema,
  response: 'CaracteristicaImovel',
};

export const caracteristicaImovelFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_get',
  description: dictionary.caracteristicaImovel.mcpDescription.get,
  requiredPermissions: { caracteristicaImovel: ['read'] },
  schema: toMcpJsonSchema(caracteristicaImovelFindSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelFindController(params, context);
  },
});

export async function caracteristicaImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['read'],
    },
    context,
  );

  const { id } = caracteristicaImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let caracteristicaImovel = await tx.caracteristicaImovel.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveisVinculados: {
            select: {
              id: true,
              valorTexto: true,
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

      caracteristicaImovel =
        await filePopulateDownloadUrlInTree(caracteristicaImovel);

      return caracteristicaImovel;
    },
  );
}

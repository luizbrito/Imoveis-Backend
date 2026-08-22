import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { portalImobiliarioFindSchema } from '../portalImobiliarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/portal-imobiliario/{id}',
  params: portalImobiliarioFindSchema,
  response: 'PortalImobiliario',
};

export const portalImobiliarioFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_get',
  description: dictionary.portalImobiliario.mcpDescription.get,
  requiredPermissions: { portalImobiliario: ['read'] },
  schema: toMcpJsonSchema(portalImobiliarioFindSchema),
  handler: async (params, context) => {
    return await portalImobiliarioFindController(params, context);
  },
});

export async function portalImobiliarioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['read'],
    },
    context,
  );

  const { id } = portalImobiliarioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let portalImobiliario = await tx.portalImobiliario.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          publicacoes: {
            select: {
              id: true,
              codigoExterno: true,
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

      portalImobiliario =
        await filePopulateDownloadUrlInTree(portalImobiliario);

      return portalImobiliario;
    },
  );
}

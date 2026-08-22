import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { favoritoClienteFindSchema } from '../favoritoClienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/favorito-cliente/{id}',
  params: favoritoClienteFindSchema,
  response: 'FavoritoCliente',
};

export const favoritoClienteFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_get',
  description: dictionary.favoritoCliente.mcpDescription.get,
  requiredPermissions: { favoritoCliente: ['read'] },
  schema: toMcpJsonSchema(favoritoClienteFindSchema),
  handler: async (params, context) => {
    return await favoritoClienteFindController(params, context);
  },
});

export async function favoritoClienteFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['read'],
    },
    context,
  );

  const { id } = favoritoClienteFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let favoritoCliente = await tx.favoritoCliente.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
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

      favoritoCliente = await filePopulateDownloadUrlInTree(favoritoCliente);

      return favoritoCliente;
    },
  );
}

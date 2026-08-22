import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condominioFindSchema } from '../condominioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condominio/{id}',
  params: condominioFindSchema,
  response: 'Condominio',
};

export const condominioFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'condominio_get',
  description: dictionary.condominio.mcpDescription.get,
  requiredPermissions: { condominio: ['read'] },
  schema: toMcpJsonSchema(condominioFindSchema),
  handler: async (params, context) => {
    return await condominioFindController(params, context);
  },
});

export async function condominioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['read'],
    },
    context,
  );

  const { id } = condominioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let condominio = await tx.condominio.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
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

      condominio = await filePopulateDownloadUrlInTree(condominio);

      return condominio;
    },
  );
}

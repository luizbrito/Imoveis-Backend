import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoComercialRuralFindSchema } from '../condicaoComercialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-comercial-rural/{id}',
  params: condicaoComercialRuralFindSchema,
  response: 'CondicaoComercialRural',
};

export const condicaoComercialRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_get',
  description: dictionary.condicaoComercialRural.mcpDescription.get,
  requiredPermissions: { condicaoComercialRural: ['read'] },
  schema: toMcpJsonSchema(condicaoComercialRuralFindSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralFindController(params, context);
  },
});

export async function condicaoComercialRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['read'],
    },
    context,
  );

  const { id } = condicaoComercialRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let condicaoComercialRural = await tx.condicaoComercialRural.findUnique({
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

      condicaoComercialRural = await filePopulateDownloadUrlInTree(
        condicaoComercialRural,
      );

      return condicaoComercialRural;
    },
  );
}

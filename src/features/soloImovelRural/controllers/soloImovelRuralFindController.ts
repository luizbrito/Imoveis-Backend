import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { soloImovelRuralFindSchema } from '../soloImovelRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solo-imovel-rural/{id}',
  params: soloImovelRuralFindSchema,
  response: 'SoloImovelRural',
};

export const soloImovelRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_get',
  description: dictionary.soloImovelRural.mcpDescription.get,
  requiredPermissions: { soloImovelRural: ['read'] },
  schema: toMcpJsonSchema(soloImovelRuralFindSchema),
  handler: async (params, context) => {
    return await soloImovelRuralFindController(params, context);
  },
});

export async function soloImovelRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['read'],
    },
    context,
  );

  const { id } = soloImovelRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let soloImovelRural = await tx.soloImovelRural.findUnique({
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
          tipoSolo: {
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

      soloImovelRural = await filePopulateDownloadUrlInTree(soloImovelRural);

      return soloImovelRural;
    },
  );
}

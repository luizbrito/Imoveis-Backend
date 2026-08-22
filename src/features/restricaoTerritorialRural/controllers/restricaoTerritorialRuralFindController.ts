import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { restricaoTerritorialRuralFindSchema } from '../restricaoTerritorialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/restricao-territorial-rural/{id}',
  params: restricaoTerritorialRuralFindSchema,
  response: 'RestricaoTerritorialRural',
};

export const restricaoTerritorialRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_get',
  description: dictionary.restricaoTerritorialRural.mcpDescription.get,
  requiredPermissions: { restricaoTerritorialRural: ['read'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralFindSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralFindController(params, context);
  },
});

export async function restricaoTerritorialRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['read'],
    },
    context,
  );

  const { id } = restricaoTerritorialRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let restricaoTerritorialRural =
        await tx.restricaoTerritorialRural.findUnique({
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

      restricaoTerritorialRural = await filePopulateDownloadUrlInTree(
        restricaoTerritorialRural,
      );

      return restricaoTerritorialRural;
    },
  );
}

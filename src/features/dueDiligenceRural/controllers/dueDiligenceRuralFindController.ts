import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { dueDiligenceRuralFindSchema } from '../dueDiligenceRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/due-diligence-rural/{id}',
  params: dueDiligenceRuralFindSchema,
  response: 'DueDiligenceRural',
};

export const dueDiligenceRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_get',
  description: dictionary.dueDiligenceRural.mcpDescription.get,
  requiredPermissions: { dueDiligenceRural: ['read'] },
  schema: toMcpJsonSchema(dueDiligenceRuralFindSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralFindController(params, context);
  },
});

export async function dueDiligenceRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['read'],
    },
    context,
  );

  const { id } = dueDiligenceRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let dueDiligenceRural = await tx.dueDiligenceRural.findUnique({
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

      dueDiligenceRural =
        await filePopulateDownloadUrlInTree(dueDiligenceRural);

      return dueDiligenceRural;
    },
  );
}

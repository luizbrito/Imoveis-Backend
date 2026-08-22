import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { recursoHidricoRuralFindSchema } from '../recursoHidricoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/recurso-hidrico-rural/{id}',
  params: recursoHidricoRuralFindSchema,
  response: 'RecursoHidricoRural',
};

export const recursoHidricoRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_get',
  description: dictionary.recursoHidricoRural.mcpDescription.get,
  requiredPermissions: { recursoHidricoRural: ['read'] },
  schema: toMcpJsonSchema(recursoHidricoRuralFindSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralFindController(params, context);
  },
});

export async function recursoHidricoRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['read'],
    },
    context,
  );

  const { id } = recursoHidricoRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let recursoHidricoRural = await tx.recursoHidricoRural.findUnique({
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

      recursoHidricoRural =
        await filePopulateDownloadUrlInTree(recursoHidricoRural);

      return recursoHidricoRural;
    },
  );
}

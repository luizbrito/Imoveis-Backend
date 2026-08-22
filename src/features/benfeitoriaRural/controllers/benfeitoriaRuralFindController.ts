import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { benfeitoriaRuralFindSchema } from '../benfeitoriaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/benfeitoria-rural/{id}',
  params: benfeitoriaRuralFindSchema,
  response: 'BenfeitoriaRural',
};

export const benfeitoriaRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_get',
  description: dictionary.benfeitoriaRural.mcpDescription.get,
  requiredPermissions: { benfeitoriaRural: ['read'] },
  schema: toMcpJsonSchema(benfeitoriaRuralFindSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralFindController(params, context);
  },
});

export async function benfeitoriaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['read'],
    },
    context,
  );

  const { id } = benfeitoriaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let benfeitoriaRural = await tx.benfeitoriaRural.findUnique({
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

      benfeitoriaRural = await filePopulateDownloadUrlInTree(benfeitoriaRural);

      return benfeitoriaRural;
    },
  );
}

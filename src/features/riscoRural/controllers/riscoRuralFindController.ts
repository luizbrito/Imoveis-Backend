import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { riscoRuralFindSchema } from '../riscoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/risco-rural/{id}',
  params: riscoRuralFindSchema,
  response: 'RiscoRural',
};

export const riscoRuralFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'riscoRural_get',
  description: dictionary.riscoRural.mcpDescription.get,
  requiredPermissions: { riscoRural: ['read'] },
  schema: toMcpJsonSchema(riscoRuralFindSchema),
  handler: async (params, context) => {
    return await riscoRuralFindController(params, context);
  },
});

export async function riscoRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['read'],
    },
    context,
  );

  const { id } = riscoRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let riscoRural = await tx.riscoRural.findUnique({
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

      riscoRural = await filePopulateDownloadUrlInTree(riscoRural);

      return riscoRural;
    },
  );
}

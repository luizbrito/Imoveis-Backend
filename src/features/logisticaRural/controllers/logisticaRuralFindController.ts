import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { logisticaRuralFindSchema } from '../logisticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/logistica-rural/{id}',
  params: logisticaRuralFindSchema,
  response: 'LogisticaRural',
};

export const logisticaRuralFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'logisticaRural_get',
  description: dictionary.logisticaRural.mcpDescription.get,
  requiredPermissions: { logisticaRural: ['read'] },
  schema: toMcpJsonSchema(logisticaRuralFindSchema),
  handler: async (params, context) => {
    return await logisticaRuralFindController(params, context);
  },
});

export async function logisticaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['read'],
    },
    context,
  );

  const { id } = logisticaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let logisticaRural = await tx.logisticaRural.findUnique({
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

      logisticaRural = await filePopulateDownloadUrlInTree(logisticaRural);

      return logisticaRural;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tipoSoloFindSchema } from '../tipoSoloSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tipo-solo/{id}',
  params: tipoSoloFindSchema,
  response: 'TipoSolo',
};

export const tipoSoloFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_get',
  description: dictionary.tipoSolo.mcpDescription.get,
  requiredPermissions: { tipoSolo: ['read'] },
  schema: toMcpJsonSchema(tipoSoloFindSchema),
  handler: async (params, context) => {
    return await tipoSoloFindController(params, context);
  },
});

export async function tipoSoloFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['read'],
    },
    context,
  );

  const { id } = tipoSoloFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let tipoSolo = await tx.tipoSolo.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          areasImoveis: {
            select: {
              id: true,
              nomeArea: true,
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

      tipoSolo = await filePopulateDownloadUrlInTree(tipoSolo);

      return tipoSolo;
    },
  );
}

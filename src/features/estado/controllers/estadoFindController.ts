import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { estadoFindSchema } from '../estadoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/estado/{id}',
  params: estadoFindSchema,
  response: 'Estado',
};

export const estadoFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_get',
  description: dictionary.estado.mcpDescription.get,
  requiredPermissions: { estado: ['read'] },
  schema: toMcpJsonSchema(estadoFindSchema),
  handler: async (params, context) => {
    return await estadoFindController(params, context);
  },
});

export async function estadoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['read'],
    },
    context,
  );

  const { id } = estadoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let estado = await tx.estado.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          pais: {
            select: {
              id: true,
              nome: true,
            },
          },
          cidades: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisEstado: {
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

      estado = await filePopulateDownloadUrlInTree(estado);

      return estado;
    },
  );
}

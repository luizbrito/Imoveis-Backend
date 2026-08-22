import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vistoriaFindSchema } from '../vistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/vistoria/{id}',
  params: vistoriaFindSchema,
  response: 'Vistoria',
};

export const vistoriaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_get',
  description: dictionary.vistoria.mcpDescription.get,
  requiredPermissions: { vistoria: ['read'] },
  schema: toMcpJsonSchema(vistoriaFindSchema),
  handler: async (params, context) => {
    return await vistoriaFindController(params, context);
  },
});

export async function vistoriaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['read'],
    },
    context,
  );

  const { id } = vistoriaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let vistoria = await tx.vistoria.findUnique({
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
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          itens: {
            select: {
              id: true,
              item: true,
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

      vistoria = await filePopulateDownloadUrlInTree(vistoria);

      return vistoria;
    },
  );
}

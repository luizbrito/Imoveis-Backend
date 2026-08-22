import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tarefaComercialFindSchema } from '../tarefaComercialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tarefa-comercial/{id}',
  params: tarefaComercialFindSchema,
  response: 'TarefaComercial',
};

export const tarefaComercialFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_get',
  description: dictionary.tarefaComercial.mcpDescription.get,
  requiredPermissions: { tarefaComercial: ['read'] },
  schema: toMcpJsonSchema(tarefaComercialFindSchema),
  handler: async (params, context) => {
    return await tarefaComercialFindController(params, context);
  },
});

export async function tarefaComercialFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['read'],
    },
    context,
  );

  const { id } = tarefaComercialFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let tarefaComercial = await tx.tarefaComercial.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      tarefaComercial = await filePopulateDownloadUrlInTree(tarefaComercial);

      return tarefaComercial;
    },
  );
}

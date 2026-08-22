import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { visitaFindSchema } from '../visitaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/visita/{id}',
  params: visitaFindSchema,
  response: 'Visita',
};

export const visitaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_get',
  description: dictionary.visita.mcpDescription.get,
  requiredPermissions: { visita: ['read'] },
  schema: toMcpJsonSchema(visitaFindSchema),
  handler: async (params, context) => {
    return await visitaFindController(params, context);
  },
});

export async function visitaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['read'],
    },
    context,
  );

  const { id } = visitaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let visita = await tx.visita.findUnique({
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
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
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
          propostas: {
            select: {
              id: true,
              codigo: true,
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

      visita = await filePopulateDownloadUrlInTree(visita);

      return visita;
    },
  );
}

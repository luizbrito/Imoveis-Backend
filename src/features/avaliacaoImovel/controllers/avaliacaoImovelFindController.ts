import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { avaliacaoImovelFindSchema } from '../avaliacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/avaliacao-imovel/{id}',
  params: avaliacaoImovelFindSchema,
  response: 'AvaliacaoImovel',
};

export const avaliacaoImovelFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_get',
  description: dictionary.avaliacaoImovel.mcpDescription.get,
  requiredPermissions: { avaliacaoImovel: ['read'] },
  schema: toMcpJsonSchema(avaliacaoImovelFindSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelFindController(params, context);
  },
});

export async function avaliacaoImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['read'],
    },
    context,
  );

  const { id } = avaliacaoImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let avaliacaoImovel = await tx.avaliacaoImovel.findUnique({
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
          avaliador: {
            select: {
              id: true,
              nomeCompleto: true,
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

      avaliacaoImovel = await filePopulateDownloadUrlInTree(avaliacaoImovel);

      return avaliacaoImovel;
    },
  );
}

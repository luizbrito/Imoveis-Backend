import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { captacaoImovelFindSchema } from '../captacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/captacao-imovel/{id}',
  params: captacaoImovelFindSchema,
  response: 'CaptacaoImovel',
};

export const captacaoImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'captacaoImovel_get',
  description: dictionary.captacaoImovel.mcpDescription.get,
  requiredPermissions: { captacaoImovel: ['read'] },
  schema: toMcpJsonSchema(captacaoImovelFindSchema),
  handler: async (params, context) => {
    return await captacaoImovelFindController(params, context);
  },
});

export async function captacaoImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['read'],
    },
    context,
  );

  const { id } = captacaoImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let captacaoImovel = await tx.captacaoImovel.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
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

      captacaoImovel = await filePopulateDownloadUrlInTree(captacaoImovel);

      return captacaoImovel;
    },
  );
}

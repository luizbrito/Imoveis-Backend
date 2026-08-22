import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { repasseProprietarioFindSchema } from '../repasseProprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/repasse-proprietario/{id}',
  params: repasseProprietarioFindSchema,
  response: 'RepasseProprietario',
};

export const repasseProprietarioFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_get',
  description: dictionary.repasseProprietario.mcpDescription.get,
  requiredPermissions: { repasseProprietario: ['read'] },
  schema: toMcpJsonSchema(repasseProprietarioFindSchema),
  handler: async (params, context) => {
    return await repasseProprietarioFindController(params, context);
  },
});

export async function repasseProprietarioFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['read'],
    },
    context,
  );

  const { id } = repasseProprietarioFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let repasseProprietario = await tx.repasseProprietario.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
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

      repasseProprietario =
        await filePopulateDownloadUrlInTree(repasseProprietario);

      return repasseProprietario;
    },
  );
}

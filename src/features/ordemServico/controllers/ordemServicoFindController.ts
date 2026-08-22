import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ordemServicoFindSchema } from '../ordemServicoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ordem-servico/{id}',
  params: ordemServicoFindSchema,
  response: 'OrdemServico',
};

export const ordemServicoFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'ordemServico_get',
  description: dictionary.ordemServico.mcpDescription.get,
  requiredPermissions: { ordemServico: ['read'] },
  schema: toMcpJsonSchema(ordemServicoFindSchema),
  handler: async (params, context) => {
    return await ordemServicoFindController(params, context);
  },
});

export async function ordemServicoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['read'],
    },
    context,
  );

  const { id } = ordemServicoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let ordemServico = await tx.ordemServico.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          solicitacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          despesas: {
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

      ordemServico = await filePopulateDownloadUrlInTree(ordemServico);

      return ordemServico;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { simulacaoFinanciamentoFindSchema } from '../simulacaoFinanciamentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/simulacao-financiamento/{id}',
  params: simulacaoFinanciamentoFindSchema,
  response: 'SimulacaoFinanciamento',
};

export const simulacaoFinanciamentoFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_get',
  description: dictionary.simulacaoFinanciamento.mcpDescription.get,
  requiredPermissions: { simulacaoFinanciamento: ['read'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoFindSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoFindController(params, context);
  },
});

export async function simulacaoFinanciamentoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['read'],
    },
    context,
  );

  const { id } = simulacaoFinanciamentoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let simulacaoFinanciamento = await tx.simulacaoFinanciamento.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
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
          proposta: {
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

      simulacaoFinanciamento = await filePopulateDownloadUrlInTree(
        simulacaoFinanciamento,
      );

      return simulacaoFinanciamento;
    },
  );
}

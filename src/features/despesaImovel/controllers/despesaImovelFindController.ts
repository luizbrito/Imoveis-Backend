import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { despesaImovelFindSchema } from '../despesaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/despesa-imovel/{id}',
  params: despesaImovelFindSchema,
  response: 'DespesaImovel',
};

export const despesaImovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'despesaImovel_get',
  description: dictionary.despesaImovel.mcpDescription.get,
  requiredPermissions: { despesaImovel: ['read'] },
  schema: toMcpJsonSchema(despesaImovelFindSchema),
  handler: async (params, context) => {
    return await despesaImovelFindController(params, context);
  },
});

export async function despesaImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['read'],
    },
    context,
  );

  const { id } = despesaImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let despesaImovel = await tx.despesaImovel.findUnique({
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
          fornecedor: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          ordemServico: {
            select: {
              id: true,
              codigo: true,
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

      despesaImovel = await filePopulateDownloadUrlInTree(despesaImovel);

      return despesaImovel;
    },
  );
}

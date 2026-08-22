import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vendaFindSchema } from '../vendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/venda/{id}',
  params: vendaFindSchema,
  response: 'Venda',
};

export const vendaFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_get',
  description: dictionary.venda.mcpDescription.get,
  requiredPermissions: { venda: ['read'] },
  schema: toMcpJsonSchema(vendaFindSchema),
  handler: async (params, context) => {
    return await vendaFindController(params, context);
  },
});

export async function vendaFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['read'],
    },
    context,
  );

  const { id } = vendaFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let venda = await tx.venda.findUnique({
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
          proposta: {
            select: {
              id: true,
              codigo: true,
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
          comprador: {
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
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          parcelas: {
            select: {
              id: true,
              numeroParcela: true,
            },
          },
          comissoes: {
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

      venda = await filePopulateDownloadUrlInTree(venda);

      return venda;
    },
  );
}

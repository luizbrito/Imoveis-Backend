import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filialFindSchema } from '../filialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/filial/{id}',
  params: filialFindSchema,
  response: 'Filial',
};

export const filialFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_get',
  description: dictionary.filial.mcpDescription.get,
  requiredPermissions: { filial: ['read'] },
  schema: toMcpJsonSchema(filialFindSchema),
  handler: async (params, context) => {
    return await filialFindController(params, context);
  },
});

export async function filialFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['read'],
    },
    context,
  );

  const { id } = filialFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let filial = await tx.filial.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          corretores: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          proprietarios: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          clientes: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leads: {
            select: {
              id: true,
              nome: true,
            },
          },
          campanhasMarketing: {
            select: {
              id: true,
              nome: true,
            },
          },
          vendas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          contasFinanceiras: {
            select: {
              id: true,
              nome: true,
            },
          },
          fornecedores: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          captacoesImovel: {
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
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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

      filial = await filePopulateDownloadUrlInTree(filial);

      return filial;
    },
  );
}

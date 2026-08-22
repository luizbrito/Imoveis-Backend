import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { locacaoFindSchema } from '../locacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/locacao/{id}',
  params: locacaoFindSchema,
  response: 'Locacao',
};

export const locacaoFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_get',
  description: dictionary.locacao.mcpDescription.get,
  requiredPermissions: { locacao: ['read'] },
  schema: toMcpJsonSchema(locacaoFindSchema),
  handler: async (params, context) => {
    return await locacaoFindController(params, context);
  },
});

export async function locacaoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['read'],
    },
    context,
  );

  const { id } = locacaoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let locacao = await tx.locacao.findUnique({
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
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          participantes: {
            select: {
              id: true,
              papel: true,
            },
          },
          garantias: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          cobrancas: {
            select: {
              id: true,
              competencia: true,
            },
          },
          reajustes: {
            select: {
              id: true,
              dataBase: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesManutencao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          seguros: {
            select: {
              id: true,
              numeroApolice: true,
            },
          },
          ocorrencias: {
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

      locacao = await filePopulateDownloadUrlInTree(locacao);

      return locacao;
    },
  );
}

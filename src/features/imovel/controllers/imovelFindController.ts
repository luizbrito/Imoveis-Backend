import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelFindSchema } from '../imovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel/{id}',
  params: imovelFindSchema,
  response: 'Imovel',
};

export const imovelFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_get',
  description: dictionary.imovel.mcpDescription.get,
  requiredPermissions: { imovel: ['read'] },
  schema: toMcpJsonSchema(imovelFindSchema),
  handler: async (params, context) => {
    return await imovelFindController(params, context);
  },
});

export async function imovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovel: ['read'],
    },
    context,
  );

  const { id } = imovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let imovel = await tx.imovel.findUnique({
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
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          condominio: {
            select: {
              id: true,
              nome: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          vinculosCaracteristicas: {
            select: {
              id: true,
              valorTexto: true,
            },
          },
          midias: {
            select: {
              id: true,
              titulo: true,
            },
          },
          documentos: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          avaliacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          chaves: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistorias: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anuncios: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
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
          favoritosClientes: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          solicitacoesContato: {
            select: {
              id: true,
              nome: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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
          arquivosKml: {
            select: {
              id: true,
              nome: true,
            },
          },
          documentacoesRuraisBrasil: {
            select: {
              id: true,
              matriculaNumero: true,
            },
          },
          referenciasClimaticas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          solosRurais: {
            select: {
              id: true,
              nomeArea: true,
            },
          },
          topografias: {
            select: {
              id: true,
              descricao: true,
            },
          },
          recursosHidricos: {
            select: {
              id: true,
              nome: true,
            },
          },
          energiaConectividade: {
            select: {
              id: true,
              descricao: true,
            },
          },
          logisticas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          pistasAviacao: {
            select: {
              id: true,
              nome: true,
            },
          },
          benfeitoriasRurais: {
            select: {
              id: true,
              nome: true,
            },
          },
          divisoesOperacionais: {
            select: {
              id: true,
              nome: true,
            },
          },
          producoesHistoricas: {
            select: {
              id: true,
              safraAno: true,
            },
          },
          sistemasProdutivos: {
            select: {
              id: true,
              nome: true,
            },
          },
          ativosIncluidosVenda: {
            select: {
              id: true,
              nome: true,
            },
          },
          restricoesTerritoriais: {
            select: {
              id: true,
              tipo: true,
            },
          },
          riscosRurais: {
            select: {
              id: true,
              tipo: true,
            },
          },
          certificacoesSustentabilidade: {
            select: {
              id: true,
              nome: true,
            },
          },
          condicoesComerciaisRurais: {
            select: {
              id: true,
              precoPorHa: true,
            },
          },
          dueDiligences: {
            select: {
              id: true,
              titulo: true,
            },
          },
          pais: {
            select: {
              id: true,
              nome: true,
            },
          },
          estado: {
            select: {
              id: true,
              nome: true,
            },
          },
          cidadeCadastro: {
            select: {
              id: true,
              nome: true,
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

      imovel = await filePopulateDownloadUrlInTree(imovel);

      return imovel;
    },
  );
}

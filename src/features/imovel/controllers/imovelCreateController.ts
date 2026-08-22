import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { imovelCreateInputSchema } from '../imovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/imovel',
  body: imovelCreateInputSchema,
  response: 'Imovel',
};

export const imovelCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_create',
  description: dictionary.imovel.mcpDescription.create,
  requiredPermissions: { imovel: ['create'] },
  schema: toMcpJsonSchema(imovelCreateInputSchema),
  handler: async (params, context) => {
    return await imovelCreateController(params, context);
  },
});

export async function imovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      imovel: ['create'],
    },
    context,
  );
  return await imovelCreate(body, context);
}

export async function imovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = imovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.imovel.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.imovel.fields.codigo,
          ),
        );
      }

      const newImovel = await tx.imovel.create({
        data: {
          codigo: data.codigo,
          titulo: data.titulo,
          tipo: data.tipo,
          finalidade: data.finalidade,
          status: data.status,
          exclusividade: data.exclusividade,
          valorVenda: data.valorVenda,
          valorLocacao: data.valorLocacao,
          valorCondominio: data.valorCondominio,
          valorIptuAnual: data.valorIptuAnual,
          moeda: data.moeda,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          latitude: data.latitude,
          longitude: data.longitude,
          areaTotal: data.areaTotal,
          areaPrivativa: data.areaPrivativa,
          areaTerreno: data.areaTerreno,
          quartos: data.quartos,
          suites: data.suites,
          banheiros: data.banheiros,
          vagas: data.vagas,
          andar: data.andar,
          anoConstrucao: data.anoConstrucao,
          mobiliado: data.mobiliado,
          aceitaPet: data.aceitaPet,
          aceitaFinanciamento: data.aceitaFinanciamento,
          ocupacao: data.ocupacao,
          descricao: data.descricao,
          observacoesInternas: data.observacoesInternas,
          destaque: data.destaque,
          publicavel: data.publicavel,
          imovelRural: data.imovelRural,
          nomeRural: data.nomeRural,
          municipioRural: data.municipioRural,
          areaTotalHa: data.areaTotalHa,
          modulosFiscais: data.modulosFiscais,
          precipitacaoMediaAnualMm: data.precipitacaoMediaAnualMm,
          faixaPluviometrica: data.faixaPluviometrica,
          riscoSeca: data.riscoSeca,
          soloPredominante: data.soloPredominante,
          percentualSoloAgricola: data.percentualSoloAgricola,
          aptidaoAgricolaSolo: data.aptidaoAgricolaSolo,
          regiaoGeografica: data.regiaoGeografica,
          nivelDesenvolvimento: data.nivelDesenvolvimento,
          possuiAcessoAereo: data.possuiAcessoAereo,
          possuiFrenteRio: data.possuiFrenteRio,
          nomeCursoAguaPrincipal: data.nomeCursoAguaPrincipal,
          extensaoFrenteRioKm: data.extensaoFrenteRioKm,
          areaProdutivaHa: data.areaProdutivaHa,
          percentualAreaProdutiva: data.percentualAreaProdutiva,
          areaPreservadaHa: data.areaPreservadaHa,
          percentualReservaBosque: data.percentualReservaBosque,
          areaNaoClassificadaHa: data.areaNaoClassificadaHa,
          valorTotalEstimado: data.valorTotalEstimado,
          diasNoMercado: data.diasNoMercado,
          capacidadeSuporteUaHa: data.capacidadeSuporteUaHa,
          capacidadeSuporteCabecas: data.capacidadeSuporteCabecas,
          areaIrrigadaHa: data.areaIrrigadaHa,
          possuiPistaAviacao: data.possuiPistaAviacao,
          scoreGeralFazenda: data.scoreGeralFazenda,
          mapaUsoAlternativo: data.mapaUsoAlternativo,
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          pais: prismaRelationship.connectOne(data.pais),
          estado: prismaRelationship.connectOne(data.estado),
          cidadeCadastro: prismaRelationship.connectOne(data.cidadeCadastro),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
          corretorResponsavel: prismaRelationship.connectOneOrThrow(
            data.corretorResponsavel,
          ),
          condominio: prismaRelationship.connectOne(data.condominio),
          empreendimento: prismaRelationship.connectOne(data.empreendimento),
          importHash: data.importHash,
          organization: prismaRelationship.connectOneOrThrow(
            context.currentOrganization!.id,
          ),
          createdByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
          createdByUserId: context.currentUser?.id,
        },
        include: {
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
          filial: {
            select: {
              id: true,
              nome: true,
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
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      await auditLogCreate({
        entityId: newImovel.id,
        entityName: 'Imovel',
        operation: auditLogOperations.create,
        context,
        newData: newImovel,
        tx,
      });

      const imovel = await filePopulateDownloadUrlInTree(newImovel);

      return imovel;
    },
  );
}

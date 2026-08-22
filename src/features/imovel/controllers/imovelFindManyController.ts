import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { imovelFindManyInputSchema } from '../imovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { prisma } from '../../../prisma';

export const imovelFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel',
  query: imovelFindManyInputSchema,
  response: '{ imoveis: Imovel[], count: number }',
};

export const imovelFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_list',
  description: dictionary.imovel.mcpDescription.list,
  requiredPermissions: { imovel: ['read'] },
  schema: toMcpJsonSchema(imovelFindManyInputSchema),
  handler: async (params, context) => {
    return await imovelFindManyController(params, context);
  },
});

export async function imovelFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovel: ['read'],
    },
    context,
  );

  const { filter, orderBy, skip, take } =
    imovelFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ImovelWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.archived !== 'true') {
        whereAnd.push({ archivedAt: null });
      }
      if (filter?.codigo != null) {
        whereAnd.push({
          codigo: { contains: filter?.codigo, mode: 'insensitive' },
        });
      }
      if (filter?.titulo != null) {
        whereAnd.push({
          titulo: { contains: filter?.titulo, mode: 'insensitive' },
        });
      }
      if (filter?.tipo != null) {
        whereAnd.push({
          tipo: filter?.tipo,
        });
      }
      if (filter?.finalidade?.length) {
        whereAnd.push({
          finalidade: {
            hasSome: filter.finalidade,
          },
        });
      }
      if (filter?.status != null) {
        whereAnd.push({
          status: filter?.status,
        });
      }
      if (filter?.exclusividade != null) {
        whereAnd.push({
          exclusividade: filter.exclusividade === 'true',
        });
      }
      if (filter?.valorVendaRange?.length) {
        const start = filter.valorVendaRange?.[0];
        const end = filter.valorVendaRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorVenda: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorVenda: { lte: end },
          });
        }
      }
      if (filter?.valorLocacaoRange?.length) {
        const start = filter.valorLocacaoRange?.[0];
        const end = filter.valorLocacaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorLocacao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorLocacao: { lte: end },
          });
        }
      }
      if (filter?.valorCondominioRange?.length) {
        const start = filter.valorCondominioRange?.[0];
        const end = filter.valorCondominioRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorCondominio: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorCondominio: { lte: end },
          });
        }
      }
      if (filter?.valorIptuAnualRange?.length) {
        const start = filter.valorIptuAnualRange?.[0];
        const end = filter.valorIptuAnualRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorIptuAnual: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorIptuAnual: { lte: end },
          });
        }
      }
      if (filter?.moeda != null) {
        whereAnd.push({
          moeda: filter?.moeda,
        });
      }
      if (filter?.logradouro != null) {
        whereAnd.push({
          logradouro: { contains: filter?.logradouro, mode: 'insensitive' },
        });
      }
      if (filter?.numero != null) {
        whereAnd.push({
          numero: { contains: filter?.numero, mode: 'insensitive' },
        });
      }
      if (filter?.complemento != null) {
        whereAnd.push({
          complemento: { contains: filter?.complemento, mode: 'insensitive' },
        });
      }
      if (filter?.bairro != null) {
        whereAnd.push({
          bairro: { contains: filter?.bairro, mode: 'insensitive' },
        });
      }
      if (filter?.cidade != null) {
        whereAnd.push({
          cidade: { contains: filter?.cidade, mode: 'insensitive' },
        });
      }
      if (filter?.uf != null) {
        whereAnd.push({
          uf: filter?.uf,
        });
      }
      if (filter?.cep != null) {
        whereAnd.push({
          cep: { contains: filter?.cep, mode: 'insensitive' },
        });
      }
      if (filter?.latitudeRange?.length) {
        const start = filter.latitudeRange?.[0];
        const end = filter.latitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            latitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            latitude: { lte: end },
          });
        }
      }
      if (filter?.longitudeRange?.length) {
        const start = filter.longitudeRange?.[0];
        const end = filter.longitudeRange?.[1];

        if (start != null) {
          whereAnd.push({
            longitude: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            longitude: { lte: end },
          });
        }
      }
      if (filter?.areaTotalRange?.length) {
        const start = filter.areaTotalRange?.[0];
        const end = filter.areaTotalRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaTotal: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaTotal: { lte: end },
          });
        }
      }
      if (filter?.areaPrivativaRange?.length) {
        const start = filter.areaPrivativaRange?.[0];
        const end = filter.areaPrivativaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaPrivativa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaPrivativa: { lte: end },
          });
        }
      }
      if (filter?.areaTerrenoRange?.length) {
        const start = filter.areaTerrenoRange?.[0];
        const end = filter.areaTerrenoRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaTerreno: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaTerreno: { lte: end },
          });
        }
      }
      if (filter?.quartosRange?.length) {
        const start = filter.quartosRange?.[0];
        const end = filter.quartosRange?.[1];

        if (start != null) {
          whereAnd.push({
            quartos: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            quartos: { lte: end },
          });
        }
      }
      if (filter?.suitesRange?.length) {
        const start = filter.suitesRange?.[0];
        const end = filter.suitesRange?.[1];

        if (start != null) {
          whereAnd.push({
            suites: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            suites: { lte: end },
          });
        }
      }
      if (filter?.banheirosRange?.length) {
        const start = filter.banheirosRange?.[0];
        const end = filter.banheirosRange?.[1];

        if (start != null) {
          whereAnd.push({
            banheiros: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            banheiros: { lte: end },
          });
        }
      }
      if (filter?.vagasRange?.length) {
        const start = filter.vagasRange?.[0];
        const end = filter.vagasRange?.[1];

        if (start != null) {
          whereAnd.push({
            vagas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            vagas: { lte: end },
          });
        }
      }
      if (filter?.andarRange?.length) {
        const start = filter.andarRange?.[0];
        const end = filter.andarRange?.[1];

        if (start != null) {
          whereAnd.push({
            andar: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            andar: { lte: end },
          });
        }
      }
      if (filter?.anoConstrucaoRange?.length) {
        const start = filter.anoConstrucaoRange?.[0];
        const end = filter.anoConstrucaoRange?.[1];

        if (start != null) {
          whereAnd.push({
            anoConstrucao: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            anoConstrucao: { lte: end },
          });
        }
      }
      if (filter?.mobiliado != null) {
        whereAnd.push({
          mobiliado: filter?.mobiliado,
        });
      }
      if (filter?.aceitaPet != null) {
        whereAnd.push({
          aceitaPet: filter.aceitaPet === 'true',
        });
      }
      if (filter?.aceitaFinanciamento != null) {
        whereAnd.push({
          aceitaFinanciamento: filter.aceitaFinanciamento === 'true',
        });
      }
      if (filter?.ocupacao != null) {
        whereAnd.push({
          ocupacao: filter?.ocupacao,
        });
      }
      if (filter?.destaque != null) {
        whereAnd.push({
          destaque: filter.destaque === 'true',
        });
      }
      if (filter?.publicavel != null) {
        whereAnd.push({
          publicavel: filter.publicavel === 'true',
        });
      }
      if (filter?.imovelRural != null) {
        whereAnd.push({
          imovelRural: filter.imovelRural === 'true',
        });
      }
      if (filter?.nomeRural != null) {
        whereAnd.push({
          nomeRural: { contains: filter?.nomeRural, mode: 'insensitive' },
        });
      }
      if (filter?.municipioRural != null) {
        whereAnd.push({
          municipioRural: {
            contains: filter?.municipioRural,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.areaTotalHaRange?.length) {
        const start = filter.areaTotalHaRange?.[0];
        const end = filter.areaTotalHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaTotalHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaTotalHa: { lte: end },
          });
        }
      }
      if (filter?.modulosFiscaisRange?.length) {
        const start = filter.modulosFiscaisRange?.[0];
        const end = filter.modulosFiscaisRange?.[1];

        if (start != null) {
          whereAnd.push({
            modulosFiscais: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            modulosFiscais: { lte: end },
          });
        }
      }
      if (filter?.precipitacaoMediaAnualMmRange?.length) {
        const start = filter.precipitacaoMediaAnualMmRange?.[0];
        const end = filter.precipitacaoMediaAnualMmRange?.[1];

        if (start != null) {
          whereAnd.push({
            precipitacaoMediaAnualMm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            precipitacaoMediaAnualMm: { lte: end },
          });
        }
      }
      if (filter?.faixaPluviometrica != null) {
        whereAnd.push({
          faixaPluviometrica: {
            contains: filter?.faixaPluviometrica,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.riscoSeca != null) {
        whereAnd.push({
          riscoSeca: filter?.riscoSeca,
        });
      }
      if (filter?.soloPredominante != null) {
        whereAnd.push({
          soloPredominante: {
            contains: filter?.soloPredominante,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.percentualSoloAgricolaRange?.length) {
        const start = filter.percentualSoloAgricolaRange?.[0];
        const end = filter.percentualSoloAgricolaRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualSoloAgricola: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualSoloAgricola: { lte: end },
          });
        }
      }
      if (filter?.aptidaoAgricolaSolo != null) {
        whereAnd.push({
          aptidaoAgricolaSolo: filter?.aptidaoAgricolaSolo,
        });
      }
      if (filter?.regiaoGeografica != null) {
        whereAnd.push({
          regiaoGeografica: {
            contains: filter?.regiaoGeografica,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.nivelDesenvolvimento != null) {
        whereAnd.push({
          nivelDesenvolvimento: filter?.nivelDesenvolvimento,
        });
      }
      if (filter?.possuiAcessoAereo != null) {
        whereAnd.push({
          possuiAcessoAereo: filter.possuiAcessoAereo === 'true',
        });
      }
      if (filter?.possuiFrenteRio != null) {
        whereAnd.push({
          possuiFrenteRio: filter.possuiFrenteRio === 'true',
        });
      }
      if (filter?.nomeCursoAguaPrincipal != null) {
        whereAnd.push({
          nomeCursoAguaPrincipal: {
            contains: filter?.nomeCursoAguaPrincipal,
            mode: 'insensitive',
          },
        });
      }
      if (filter?.extensaoFrenteRioKmRange?.length) {
        const start = filter.extensaoFrenteRioKmRange?.[0];
        const end = filter.extensaoFrenteRioKmRange?.[1];

        if (start != null) {
          whereAnd.push({
            extensaoFrenteRioKm: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            extensaoFrenteRioKm: { lte: end },
          });
        }
      }
      if (filter?.areaProdutivaHaRange?.length) {
        const start = filter.areaProdutivaHaRange?.[0];
        const end = filter.areaProdutivaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaProdutivaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaProdutivaHa: { lte: end },
          });
        }
      }
      if (filter?.percentualAreaProdutivaRange?.length) {
        const start = filter.percentualAreaProdutivaRange?.[0];
        const end = filter.percentualAreaProdutivaRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualAreaProdutiva: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualAreaProdutiva: { lte: end },
          });
        }
      }
      if (filter?.areaPreservadaHaRange?.length) {
        const start = filter.areaPreservadaHaRange?.[0];
        const end = filter.areaPreservadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaPreservadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaPreservadaHa: { lte: end },
          });
        }
      }
      if (filter?.percentualReservaBosqueRange?.length) {
        const start = filter.percentualReservaBosqueRange?.[0];
        const end = filter.percentualReservaBosqueRange?.[1];

        if (start != null) {
          whereAnd.push({
            percentualReservaBosque: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            percentualReservaBosque: { lte: end },
          });
        }
      }
      if (filter?.areaNaoClassificadaHaRange?.length) {
        const start = filter.areaNaoClassificadaHaRange?.[0];
        const end = filter.areaNaoClassificadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaNaoClassificadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaNaoClassificadaHa: { lte: end },
          });
        }
      }
      if (filter?.valorTotalEstimadoRange?.length) {
        const start = filter.valorTotalEstimadoRange?.[0];
        const end = filter.valorTotalEstimadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            valorTotalEstimado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            valorTotalEstimado: { lte: end },
          });
        }
      }
      if (filter?.diasNoMercadoRange?.length) {
        const start = filter.diasNoMercadoRange?.[0];
        const end = filter.diasNoMercadoRange?.[1];

        if (start != null) {
          whereAnd.push({
            diasNoMercado: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            diasNoMercado: { lte: end },
          });
        }
      }
      if (filter?.capacidadeSuporteUaHaRange?.length) {
        const start = filter.capacidadeSuporteUaHaRange?.[0];
        const end = filter.capacidadeSuporteUaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            capacidadeSuporteUaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            capacidadeSuporteUaHa: { lte: end },
          });
        }
      }
      if (filter?.capacidadeSuporteCabecasRange?.length) {
        const start = filter.capacidadeSuporteCabecasRange?.[0];
        const end = filter.capacidadeSuporteCabecasRange?.[1];

        if (start != null) {
          whereAnd.push({
            capacidadeSuporteCabecas: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            capacidadeSuporteCabecas: { lte: end },
          });
        }
      }
      if (filter?.areaIrrigadaHaRange?.length) {
        const start = filter.areaIrrigadaHaRange?.[0];
        const end = filter.areaIrrigadaHaRange?.[1];

        if (start != null) {
          whereAnd.push({
            areaIrrigadaHa: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            areaIrrigadaHa: { lte: end },
          });
        }
      }
      if (filter?.possuiPistaAviacao != null) {
        whereAnd.push({
          possuiPistaAviacao: filter.possuiPistaAviacao === 'true',
        });
      }
      if (filter?.scoreGeralFazendaRange?.length) {
        const start = filter.scoreGeralFazendaRange?.[0];
        const end = filter.scoreGeralFazendaRange?.[1];

        if (start != null) {
          whereAnd.push({
            scoreGeralFazenda: { gte: start },
          });
        }

        if (end != null) {
          whereAnd.push({
            scoreGeralFazenda: { lte: end },
          });
        }
      }
      if (filter?.filial != null) {
        whereAnd.push({
          filial: {
            id: filter.filial,
          },
        });
      }
      if (filter?.pais != null) {
        whereAnd.push({
          pais: {
            id: filter.pais,
          },
        });
      }
      if (filter?.estado != null) {
        whereAnd.push({
          estado: {
            id: filter.estado,
          },
        });
      }
      if (filter?.cidadeCadastro != null) {
        whereAnd.push({
          cidadeCadastro: {
            id: filter.cidadeCadastro,
          },
        });
      }
      if (filter?.proprietario != null) {
        whereAnd.push({
          proprietario: {
            id: filter.proprietario,
          },
        });
      }
      if (filter?.corretorResponsavel != null) {
        whereAnd.push({
          corretorResponsavel: {
            id: filter.corretorResponsavel,
          },
        });
      }
      if (filter?.condominio != null) {
        whereAnd.push({
          condominio: {
            id: filter.condominio,
          },
        });
      }
      if (filter?.empreendimento != null) {
        whereAnd.push({
          empreendimento: {
            id: filter.empreendimento,
          },
        });
      }
      if (filter?.createdByMember != null) {
        whereAnd.push({
          createdByMember: {
            id: filter.createdByMember,
          },
        });
      }

      if (filter?.updatedByMember != null) {
        whereAnd.push({
          updatedByMember: {
            id: filter.updatedByMember,
          },
        });
      }

      if (filter?.createdAtRange?.length) {
        const start = filter.createdAtRange?.[0];
        const end = filter.createdAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            createdAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            createdAt: {
              lte: end,
            },
          });
        }
      }

      if (filter?.updatedAtRange?.length) {
        const start = filter.updatedAtRange?.[0];
        const end = filter.updatedAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            updatedAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            updatedAt: {
              lte: end,
            },
          });
        }
      }

      let imoveis = await tx.imovel.findMany({
        where: {
          AND: whereAnd,
        },
        skip,
        take,
        orderBy,
        include: {
          filial: true,
          pais: true,
          estado: true,
          cidadeCadastro: true,
          proprietario: true,
          corretorResponsavel: true,
          condominio: true,
          empreendimento: true,
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
        },
      });

      const count = await tx.imovel.count({
        where: {
          AND: whereAnd,
        },
      });

      imoveis = await filePopulateDownloadUrlInTree(imoveis);

      return { imoveis, count };
    },
  );
}

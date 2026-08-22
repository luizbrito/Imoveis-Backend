import { Imovel } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import { dateOptionalSchema } from '../../shared/schemas/dateSchema';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { importerInputSchema } from '../../shared/schemas/importerSchemas';
import {
  numberOptionalSchema,
  numberSchema,
} from '../../shared/schemas/numberSchema';
import {
  objectToUuidSchema,
  objectToUuidSchemaOptional,
} from '../../shared/schemas/objectToUuidSchema';
import { orderBySchema } from '../../shared/schemas/orderBySchema';
import { fileUploadedSchema } from '../file/fileSchemas';
import { MemberWithRelationships } from '../member/memberSchemas';
import { imovelEnumerators } from './imovelEnumerators';
import { ImovelCaracteristica } from '../../prisma/generated/client';
import { MidiaImovel } from '../../prisma/generated/client';
import { DocumentoImovel } from '../../prisma/generated/client';
import { CaptacaoImovel } from '../../prisma/generated/client';
import { AvaliacaoImovel } from '../../prisma/generated/client';
import { ChaveImovel } from '../../prisma/generated/client';
import { Vistoria } from '../../prisma/generated/client';
import { Anuncio } from '../../prisma/generated/client';
import { Visita } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { ReservaImovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { SolicitacaoManutencao } from '../../prisma/generated/client';
import { DespesaImovel } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { FavoritoCliente } from '../../prisma/generated/client';
import { SolicitacaoContato } from '../../prisma/generated/client';
import { SimulacaoFinanciamento } from '../../prisma/generated/client';
import { ContratoAdministracao } from '../../prisma/generated/client';
import { SeguroImovel } from '../../prisma/generated/client';
import { OcorrenciaImovel } from '../../prisma/generated/client';
import { ArquivoKml } from '../../prisma/generated/client';
import { DocumentacaoRuralBrasil } from '../../prisma/generated/client';
import { ReferenciaClimaticaRural } from '../../prisma/generated/client';
import { SoloImovelRural } from '../../prisma/generated/client';
import { TopografiaRural } from '../../prisma/generated/client';
import { RecursoHidricoRural } from '../../prisma/generated/client';
import { InfraestruturaEnergiaConectividade } from '../../prisma/generated/client';
import { LogisticaRural } from '../../prisma/generated/client';
import { PistaAviacaoRural } from '../../prisma/generated/client';
import { BenfeitoriaRural } from '../../prisma/generated/client';
import { DivisaoOperacionalRural } from '../../prisma/generated/client';
import { ProducaoHistoricaRural } from '../../prisma/generated/client';
import { SistemaProdutivoRural } from '../../prisma/generated/client';
import { AtivoIncluidoVendaRural } from '../../prisma/generated/client';
import { RestricaoTerritorialRural } from '../../prisma/generated/client';
import { RiscoRural } from '../../prisma/generated/client';
import { CertificacaoSustentabilidadeRural } from '../../prisma/generated/client';
import { CondicaoComercialRural } from '../../prisma/generated/client';
import { DueDiligenceRural } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';
import { Pais } from '../../prisma/generated/client';
import { Estado } from '../../prisma/generated/client';
import { Cidade } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';
import { Condominio } from '../../prisma/generated/client';
import { Empreendimento } from '../../prisma/generated/client';

export const imovelFindSchema = z.object({
  id: z.string(),
});

export const imovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    titulo: z.string(),
    tipo: z.enum(imovelEnumerators.tipo).nullable().optional(),
    finalidade: z.array(z.enum(imovelEnumerators.finalidade)),
    status: z.enum(imovelEnumerators.status).nullable().optional(),
    exclusividade: booleanStringOptionalSchema,
    valorVendaRange: z.array(numberOptionalSchema).max(2),
    valorLocacaoRange: z.array(numberOptionalSchema).max(2),
    valorCondominioRange: z.array(numberOptionalSchema).max(2),
    valorIptuAnualRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(imovelEnumerators.moeda).nullable().optional(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.enum(imovelEnumerators.uf).nullable().optional(),
    cep: z.string(),
    latitudeRange: z.array(numberOptionalSchema).max(2),
    longitudeRange: z.array(numberOptionalSchema).max(2),
    areaTotalRange: z.array(numberOptionalSchema).max(2),
    areaPrivativaRange: z.array(numberOptionalSchema).max(2),
    areaTerrenoRange: z.array(numberOptionalSchema).max(2),
    quartosRange: z.array(numberOptionalSchema).max(2),
    suitesRange: z.array(numberOptionalSchema).max(2),
    banheirosRange: z.array(numberOptionalSchema).max(2),
    vagasRange: z.array(numberOptionalSchema).max(2),
    andarRange: z.array(numberOptionalSchema).max(2),
    anoConstrucaoRange: z.array(numberOptionalSchema).max(2),
    mobiliado: z.enum(imovelEnumerators.mobiliado).nullable().optional(),
    aceitaPet: booleanStringOptionalSchema,
    aceitaFinanciamento: booleanStringOptionalSchema,
    ocupacao: z.enum(imovelEnumerators.ocupacao).nullable().optional(),
    destaque: booleanStringOptionalSchema,
    publicavel: booleanStringOptionalSchema,
    imovelRural: booleanStringOptionalSchema,
    nomeRural: z.string(),
    municipioRural: z.string(),
    areaTotalHaRange: z.array(numberOptionalSchema).max(2),
    modulosFiscaisRange: z.array(numberOptionalSchema).max(2),
    precipitacaoMediaAnualMmRange: z.array(numberOptionalSchema).max(2),
    faixaPluviometrica: z.string(),
    riscoSeca: z.enum(imovelEnumerators.riscoSeca).nullable().optional(),
    soloPredominante: z.string(),
    percentualSoloAgricolaRange: z.array(numberOptionalSchema).max(2),
    aptidaoAgricolaSolo: z
      .enum(imovelEnumerators.aptidaoAgricolaSolo)
      .nullable()
      .optional(),
    regiaoGeografica: z.string(),
    nivelDesenvolvimento: z
      .enum(imovelEnumerators.nivelDesenvolvimento)
      .nullable()
      .optional(),
    possuiAcessoAereo: booleanStringOptionalSchema,
    possuiFrenteRio: booleanStringOptionalSchema,
    nomeCursoAguaPrincipal: z.string(),
    extensaoFrenteRioKmRange: z.array(numberOptionalSchema).max(2),
    areaProdutivaHaRange: z.array(numberOptionalSchema).max(2),
    percentualAreaProdutivaRange: z.array(numberOptionalSchema).max(2),
    areaPreservadaHaRange: z.array(numberOptionalSchema).max(2),
    percentualReservaBosqueRange: z.array(numberOptionalSchema).max(2),
    areaNaoClassificadaHaRange: z.array(numberOptionalSchema).max(2),
    valorTotalEstimadoRange: z.array(numberOptionalSchema).max(2),
    diasNoMercadoRange: z.array(numberOptionalSchema).max(2),
    capacidadeSuporteUaHaRange: z.array(numberOptionalSchema).max(2),
    capacidadeSuporteCabecasRange: z.array(numberOptionalSchema).max(2),
    areaIrrigadaHaRange: z.array(numberOptionalSchema).max(2),
    possuiPistaAviacao: booleanStringOptionalSchema,
    scoreGeralFazendaRange: z.array(numberOptionalSchema).max(2),
    filial: objectToUuidSchemaOptional,
    pais: objectToUuidSchemaOptional,
    estado: objectToUuidSchemaOptional,
    cidadeCadastro: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    corretorResponsavel: objectToUuidSchemaOptional,
    condominio: objectToUuidSchemaOptional,
    empreendimento: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const imovelFindManyInputSchema = z.object({
  filter: imovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const imovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const imovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const imovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).max(40),
  titulo: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(imovelEnumerators.tipo),
  finalidade: z.array(z.enum(imovelEnumerators.finalidade)).min(1).max(3),
  status: z.enum(imovelEnumerators.status),
  exclusividade: z.boolean().default(false),
  valorVenda: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorLocacao: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorCondominio: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorIptuAnual: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  moeda: z.enum(imovelEnumerators.moeda),
  logradouro: z.string().trim().min(1).max(180),
  numero: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  complemento: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.enum(imovelEnumerators.uf).nullable().optional(),
  cep: z
    .string()
    .trim()
    .max(12)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  latitude: numberOptionalSchema.pipe(
    z.number().min(-90).max(90).nullable().optional(),
  ),
  longitude: numberOptionalSchema.pipe(
    z.number().min(-180).max(180).nullable().optional(),
  ),
  areaTotal: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  areaPrivativa: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  areaTerreno: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  quartos: numberOptionalSchema.pipe(
    z.int().min(0).max(100).nullable().optional(),
  ),
  suites: numberOptionalSchema.pipe(
    z.int().min(0).max(100).nullable().optional(),
  ),
  banheiros: numberOptionalSchema.pipe(
    z.int().min(0).max(100).nullable().optional(),
  ),
  vagas: numberOptionalSchema.pipe(
    z.int().min(0).max(100).nullable().optional(),
  ),
  andar: numberOptionalSchema.pipe(
    z.int().min(-10).max(300).nullable().optional(),
  ),
  anoConstrucao: numberOptionalSchema.pipe(
    z.int().min(1800).max(2200).nullable().optional(),
  ),
  mobiliado: z.enum(imovelEnumerators.mobiliado).nullable().optional(),
  aceitaPet: z.boolean().default(false),
  aceitaFinanciamento: z.boolean().default(false),
  ocupacao: z.enum(imovelEnumerators.ocupacao).nullable().optional(),
  descricao: z
    .string()
    .trim()
    .max(8000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoesInternas: z
    .string()
    .trim()
    .max(4000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  destaque: z.boolean().default(false),
  publicavel: z.boolean().default(false),
  imovelRural: z.boolean().default(false),
  nomeRural: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  municipioRural: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  areaTotalHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  modulosFiscais: numberOptionalSchema.pipe(z.number().nullable().optional()),
  precipitacaoMediaAnualMm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  faixaPluviometrica: z
    .string()
    .trim()
    .max(80)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  riscoSeca: z.enum(imovelEnumerators.riscoSeca).nullable().optional(),
  soloPredominante: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  percentualSoloAgricola: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  aptidaoAgricolaSolo: z
    .enum(imovelEnumerators.aptidaoAgricolaSolo)
    .nullable()
    .optional(),
  regiaoGeografica: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  nivelDesenvolvimento: z
    .enum(imovelEnumerators.nivelDesenvolvimento)
    .nullable()
    .optional(),
  possuiAcessoAereo: z.boolean().default(false),
  possuiFrenteRio: z.boolean().default(false),
  nomeCursoAguaPrincipal: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  extensaoFrenteRioKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaProdutivaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  percentualAreaProdutiva: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaPreservadaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  percentualReservaBosque: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaNaoClassificadaHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  valorTotalEstimado: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  diasNoMercado: numberOptionalSchema.pipe(z.int().nullable().optional()),
  capacidadeSuporteUaHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  capacidadeSuporteCabecas: numberOptionalSchema.pipe(
    z.int().nullable().optional(),
  ),
  areaIrrigadaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  possuiPistaAviacao: z.boolean().default(false),
  scoreGeralFazenda: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  mapaUsoAlternativo: z.array(fileUploadedSchema).optional(),
  filial: objectToUuidSchema,
  pais: objectToUuidSchemaOptional,
  estado: objectToUuidSchemaOptional,
  cidadeCadastro: objectToUuidSchemaOptional,
  proprietario: objectToUuidSchema,
  corretorResponsavel: objectToUuidSchema,
  condominio: objectToUuidSchemaOptional,
  empreendimento: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const imovelImportInputSchema = imovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    mapaUsoAlternativo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const imovelImportFileSchema = z
  .object({
    codigo: z.string(),
    titulo: z.string(),
    tipo: z.string(),
    finalidade: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    status: z.string(),
    exclusividade: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    valorVenda: z.string(),
    valorLocacao: z.string(),
    valorCondominio: z.string(),
    valorIptuAnual: z.string(),
    moeda: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string(),
    cep: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    areaTotal: z.string(),
    areaPrivativa: z.string(),
    areaTerreno: z.string(),
    quartos: z.string(),
    suites: z.string(),
    banheiros: z.string(),
    vagas: z.string(),
    andar: z.string(),
    anoConstrucao: z.string(),
    mobiliado: z.string(),
    aceitaPet: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    aceitaFinanciamento: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    ocupacao: z.string(),
    descricao: z.string(),
    observacoesInternas: z.string(),
    destaque: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    publicavel: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    imovelRural: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    nomeRural: z.string(),
    municipioRural: z.string(),
    areaTotalHa: z.string(),
    modulosFiscais: z.string(),
    precipitacaoMediaAnualMm: z.string(),
    faixaPluviometrica: z.string(),
    riscoSeca: z.string(),
    soloPredominante: z.string(),
    percentualSoloAgricola: z.string(),
    aptidaoAgricolaSolo: z.string(),
    regiaoGeografica: z.string(),
    nivelDesenvolvimento: z.string(),
    possuiAcessoAereo: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    possuiFrenteRio: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    nomeCursoAguaPrincipal: z.string(),
    extensaoFrenteRioKm: z.string(),
    areaProdutivaHa: z.string(),
    percentualAreaProdutiva: z.string(),
    areaPreservadaHa: z.string(),
    percentualReservaBosque: z.string(),
    areaNaoClassificadaHa: z.string(),
    valorTotalEstimado: z.string(),
    diasNoMercado: z.string(),
    capacidadeSuporteUaHa: z.string(),
    capacidadeSuporteCabecas: z.string(),
    areaIrrigadaHa: z.string(),
    possuiPistaAviacao: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    scoreGeralFazenda: z.string(),
    mapaUsoAlternativo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    vinculosCaracteristicas: z.string().transform((val) => val.split(' ')),
    midias: z.string().transform((val) => val.split(' ')),
    documentos: z.string().transform((val) => val.split(' ')),
    captacoes: z.string().transform((val) => val.split(' ')),
    avaliacoes: z.string().transform((val) => val.split(' ')),
    chaves: z.string().transform((val) => val.split(' ')),
    vistorias: z.string().transform((val) => val.split(' ')),
    anuncios: z.string().transform((val) => val.split(' ')),
    visitas: z.string().transform((val) => val.split(' ')),
    propostas: z.string().transform((val) => val.split(' ')),
    reservas: z.string().transform((val) => val.split(' ')),
    vendas: z.string().transform((val) => val.split(' ')),
    locacoes: z.string().transform((val) => val.split(' ')),
    solicitacoesManutencao: z.string().transform((val) => val.split(' ')),
    despesas: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    favoritosClientes: z.string().transform((val) => val.split(' ')),
    solicitacoesContato: z.string().transform((val) => val.split(' ')),
    simulacoesFinanciamento: z.string().transform((val) => val.split(' ')),
    contratosAdministracao: z.string().transform((val) => val.split(' ')),
    seguros: z.string().transform((val) => val.split(' ')),
    ocorrencias: z.string().transform((val) => val.split(' ')),
    arquivosKml: z.string().transform((val) => val.split(' ')),
    documentacoesRuraisBrasil: z.string().transform((val) => val.split(' ')),
    referenciasClimaticas: z.string().transform((val) => val.split(' ')),
    solosRurais: z.string().transform((val) => val.split(' ')),
    topografias: z.string().transform((val) => val.split(' ')),
    recursosHidricos: z.string().transform((val) => val.split(' ')),
    energiaConectividade: z.string().transform((val) => val.split(' ')),
    logisticas: z.string().transform((val) => val.split(' ')),
    pistasAviacao: z.string().transform((val) => val.split(' ')),
    benfeitoriasRurais: z.string().transform((val) => val.split(' ')),
    divisoesOperacionais: z.string().transform((val) => val.split(' ')),
    producoesHistoricas: z.string().transform((val) => val.split(' ')),
    sistemasProdutivos: z.string().transform((val) => val.split(' ')),
    ativosIncluidosVenda: z.string().transform((val) => val.split(' ')),
    restricoesTerritoriais: z.string().transform((val) => val.split(' ')),
    riscosRurais: z.string().transform((val) => val.split(' ')),
    certificacoesSustentabilidade: z
      .string()
      .transform((val) => val.split(' ')),
    condicoesComerciaisRurais: z.string().transform((val) => val.split(' ')),
    dueDiligences: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
    pais: z.string(),
    estado: z.string(),
    cidadeCadastro: z.string(),
    proprietario: z.string(),
    corretorResponsavel: z.string(),
    condominio: z.string(),
    empreendimento: z.string(),
  })
  .partial();

export const imovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const imovelUpdateBodyInputSchema = imovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ImovelWithRelationships extends Imovel {
  vinculosCaracteristicas?: ImovelCaracteristica[];
  midias?: MidiaImovel[];
  documentos?: DocumentoImovel[];
  captacoes?: CaptacaoImovel[];
  avaliacoes?: AvaliacaoImovel[];
  chaves?: ChaveImovel[];
  vistorias?: Vistoria[];
  anuncios?: Anuncio[];
  visitas?: Visita[];
  propostas?: Proposta[];
  reservas?: ReservaImovel[];
  vendas?: Venda[];
  locacoes?: Locacao[];
  solicitacoesManutencao?: SolicitacaoManutencao[];
  despesas?: DespesaImovel[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  favoritosClientes?: FavoritoCliente[];
  solicitacoesContato?: SolicitacaoContato[];
  simulacoesFinanciamento?: SimulacaoFinanciamento[];
  contratosAdministracao?: ContratoAdministracao[];
  seguros?: SeguroImovel[];
  ocorrencias?: OcorrenciaImovel[];
  arquivosKml?: ArquivoKml[];
  documentacoesRuraisBrasil?: DocumentacaoRuralBrasil[];
  referenciasClimaticas?: ReferenciaClimaticaRural[];
  solosRurais?: SoloImovelRural[];
  topografias?: TopografiaRural[];
  recursosHidricos?: RecursoHidricoRural[];
  energiaConectividade?: InfraestruturaEnergiaConectividade[];
  logisticas?: LogisticaRural[];
  pistasAviacao?: PistaAviacaoRural[];
  benfeitoriasRurais?: BenfeitoriaRural[];
  divisoesOperacionais?: DivisaoOperacionalRural[];
  producoesHistoricas?: ProducaoHistoricaRural[];
  sistemasProdutivos?: SistemaProdutivoRural[];
  ativosIncluidosVenda?: AtivoIncluidoVendaRural[];
  restricoesTerritoriais?: RestricaoTerritorialRural[];
  riscosRurais?: RiscoRural[];
  certificacoesSustentabilidade?: CertificacaoSustentabilidadeRural[];
  condicoesComerciaisRurais?: CondicaoComercialRural[];
  dueDiligences?: DueDiligenceRural[];
  filial?: Filial;
  pais?: Pais;
  estado?: Estado;
  cidadeCadastro?: Cidade;
  proprietario?: Proprietario;
  corretorResponsavel?: Corretor;
  condominio?: Condominio;
  empreendimento?: Empreendimento;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

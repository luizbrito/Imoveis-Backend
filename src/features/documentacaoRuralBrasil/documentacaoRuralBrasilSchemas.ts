import { DocumentacaoRuralBrasil } from '../../prisma/generated/client';
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
import { documentacaoRuralBrasilEnumerators } from './documentacaoRuralBrasilEnumerators';
import { ArquivoKml } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';

export const documentacaoRuralBrasilFindSchema = z.object({
  id: z.string(),
});

export const documentacaoRuralBrasilFilterInputSchema = z
  .object({
    situacaoDocumental: z
      .enum(documentacaoRuralBrasilEnumerators.situacaoDocumental)
      .nullable()
      .optional(),
    matriculaNumero: z.string(),
    matriculaCartorio: z.string(),
    matriculaComarca: z.string(),
    matriculaUf: z.string(),
    matriculaDataAtualizacaoRange: z.array(dateOptionalSchema).max(2),
    codigoSncrIncra: z.string(),
    ccirExercicioRange: z.array(numberOptionalSchema).max(2),
    ccirNumero: z.string(),
    ccirSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.ccirSituacao)
      .nullable()
      .optional(),
    ccirDataEmissaoRange: z.array(dateOptionalSchema).max(2),
    ccirTaxaQuitada: booleanStringOptionalSchema,
    cib: z.string(),
    cafirSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.cafirSituacao)
      .nullable()
      .optional(),
    cnirVinculado: booleanStringOptionalSchema,
    itrUltimoExercicioRange: z.array(numberOptionalSchema).max(2),
    ditrEntregue: booleanStringOptionalSchema,
    numeroReciboDitr: z.string(),
    itrQuitado: booleanStringOptionalSchema,
    cndImovelRuralSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.cndImovelRuralSituacao)
      .nullable()
      .optional(),
    cndImovelRuralDataEmissaoRange: z.array(dateOptionalSchema).max(2),
    cndImovelRuralDataValidadeRange: z.array(dateOptionalSchema).max(2),
    carNumeroRegistro: z.string(),
    carSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.carSituacao)
      .nullable()
      .optional(),
    praSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.praSituacao)
      .nullable()
      .optional(),
    sigefCertificado: booleanStringOptionalSchema,
    sigefParcelaCodigo: z.string(),
    sigefDataCertificacaoRange: z.array(dateOptionalSchema).max(2),
    sigefSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.sigefSituacao)
      .nullable()
      .optional(),
    responsavelTecnicoNome: z.string(),
    responsavelTecnicoRegistro: z.string(),
    possuiOnusReais: booleanStringOptionalSchema,
    possuiAcaoRealReipersecutoria: booleanStringOptionalSchema,
    cadeiaDominialVerificada: booleanStringOptionalSchema,
    possuiArrendamento: booleanStringOptionalSchema,
    possuiParceriaRural: booleanStringOptionalSchema,
    licenciamentoAmbientalSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.licenciamentoAmbientalSituacao)
      .nullable()
      .optional(),
    outorgaAguaSituacao: z
      .enum(documentacaoRuralBrasilEnumerators.outorgaAguaSituacao)
      .nullable()
      .optional(),
    embargoAmbiental: booleanStringOptionalSchema,
    documentacaoConferidaEmRange: z.array(dateOptionalSchema).max(2),
    proximaRevisaoDocumentalRange: z.array(dateOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const documentacaoRuralBrasilFindManyInputSchema = z.object({
  filter: documentacaoRuralBrasilFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const documentacaoRuralBrasilDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentacaoRuralBrasilArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentacaoRuralBrasilRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentacaoRuralBrasilAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ matriculaNumero: 'asc' }),
});

export const documentacaoRuralBrasilAutocompleteOutputSchema = z.object({
  id: z.string(),
  matriculaNumero: z.string(),
});

export const documentacaoRuralBrasilCreateInputSchema = z.object({
  situacaoDocumental: z
    .enum(documentacaoRuralBrasilEnumerators.situacaoDocumental)
    .nullable()
    .optional(),
  matriculaNumero: z.string().trim().min(1).min(1).max(250),
  matriculaLivro: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  matriculaCartorio: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  matriculaComarca: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  matriculaUf: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  matriculaDataAtualizacao: dateOptionalSchema,
  matriculaArquivo: z.array(fileUploadedSchema).max(10).optional(),
  codigoSncrIncra: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ccirExercicio: numberOptionalSchema.pipe(z.int().nullable().optional()),
  ccirNumero: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ccirSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.ccirSituacao)
    .nullable()
    .optional(),
  ccirDataEmissao: dateOptionalSchema,
  ccirTaxaQuitada: z.boolean().default(false),
  ccirArquivo: z.array(fileUploadedSchema).max(10).optional(),
  cib: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cafirSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.cafirSituacao)
    .nullable()
    .optional(),
  cnirVinculado: z.boolean().default(false),
  comprovanteCafir: z.array(fileUploadedSchema).max(10).optional(),
  itrUltimoExercicio: numberOptionalSchema.pipe(z.int().nullable().optional()),
  ditrEntregue: z.boolean().default(false),
  numeroReciboDitr: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  valorItr: numberOptionalSchema.pipe(z.number().nullable().optional()),
  itrQuitado: z.boolean().default(false),
  ditrArquivo: z.array(fileUploadedSchema).max(10).optional(),
  cndImovelRuralSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.cndImovelRuralSituacao)
    .nullable()
    .optional(),
  cndImovelRuralDataEmissao: dateOptionalSchema,
  cndImovelRuralDataValidade: dateOptionalSchema,
  cndImovelRuralArquivo: z.array(fileUploadedSchema).max(10).optional(),
  carNumeroRegistro: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  carSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.carSituacao)
    .nullable()
    .optional(),
  carReciboArquivo: z.array(fileUploadedSchema).max(10).optional(),
  carDemonstrativoArquivo: z.array(fileUploadedSchema).max(10).optional(),
  areaAppHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  areaReservaLegalHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaVegetacaoNativaHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaUsoRestritoHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaConsolidadaHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  praSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.praSituacao)
    .nullable()
    .optional(),
  termoPraArquivo: z.array(fileUploadedSchema).max(10).optional(),
  sigefCertificado: z.boolean().default(false),
  sigefParcelaCodigo: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  sigefDataCertificacao: dateOptionalSchema,
  sigefSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.sigefSituacao)
    .nullable()
    .optional(),
  sigefArquivo: z.array(fileUploadedSchema).max(10).optional(),
  memorialDescritivoArquivo: z.array(fileUploadedSchema).max(10).optional(),
  plantaGeorreferenciadaArquivo: z.array(fileUploadedSchema).max(10).optional(),
  artRrtTrtArquivo: z.array(fileUploadedSchema).max(10).optional(),
  responsavelTecnicoNome: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  responsavelTecnicoRegistro: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  possuiOnusReais: z.boolean().default(false),
  descricaoOnusReais: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  certidaoOnusArquivo: z.array(fileUploadedSchema).max(10).optional(),
  possuiAcaoRealReipersecutoria: z.boolean().default(false),
  certidaoAcoesArquivo: z.array(fileUploadedSchema).max(10).optional(),
  tituloAquisicaoArquivo: z.array(fileUploadedSchema).max(10).optional(),
  cadeiaDominialVerificada: z.boolean().default(false),
  cadeiaDominialObservacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  possuiArrendamento: z.boolean().default(false),
  arrendamentoArquivo: z.array(fileUploadedSchema).max(10).optional(),
  possuiParceriaRural: z.boolean().default(false),
  parceriaRuralArquivo: z.array(fileUploadedSchema).max(10).optional(),
  licenciamentoAmbientalSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.licenciamentoAmbientalSituacao)
    .nullable()
    .optional(),
  licencasAmbientaisArquivo: z.array(fileUploadedSchema).max(10).optional(),
  outorgaAguaSituacao: z
    .enum(documentacaoRuralBrasilEnumerators.outorgaAguaSituacao)
    .nullable()
    .optional(),
  outorgaAguaArquivo: z.array(fileUploadedSchema).max(10).optional(),
  embargoAmbiental: z.boolean().default(false),
  embargoAmbientalObservacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  documentacaoConferidaEm: dateOptionalSchema,
  proximaRevisaoDocumental: dateOptionalSchema,
  pendenciasDocumentais: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const documentacaoRuralBrasilImportInputSchema =
  documentacaoRuralBrasilCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      matriculaArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      ccirArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      comprovanteCafir: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      ditrArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      cndImovelRuralArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      carReciboArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      carDemonstrativoArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      termoPraArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      sigefArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      memorialDescritivoArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      plantaGeorreferenciadaArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      artRrtTrtArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      certidaoOnusArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      certidaoAcoesArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      tituloAquisicaoArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      arrendamentoArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      parceriaRuralArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      licencasAmbientaisArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      outorgaAguaArquivo: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const documentacaoRuralBrasilImportFileSchema = z
  .object({
    situacaoDocumental: z.string(),
    matriculaNumero: z.string(),
    matriculaLivro: z.string(),
    matriculaCartorio: z.string(),
    matriculaComarca: z.string(),
    matriculaUf: z.string(),
    matriculaDataAtualizacao: z.string(),
    matriculaArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    codigoSncrIncra: z.string(),
    ccirExercicio: z.string(),
    ccirNumero: z.string(),
    ccirSituacao: z.string(),
    ccirDataEmissao: z.string(),
    ccirTaxaQuitada: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    ccirArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    cib: z.string(),
    cafirSituacao: z.string(),
    cnirVinculado: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    comprovanteCafir: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    itrUltimoExercicio: z.string(),
    ditrEntregue: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    numeroReciboDitr: z.string(),
    valorItr: z.string(),
    itrQuitado: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    ditrArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    cndImovelRuralSituacao: z.string(),
    cndImovelRuralDataEmissao: z.string(),
    cndImovelRuralDataValidade: z.string(),
    cndImovelRuralArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    carNumeroRegistro: z.string(),
    carSituacao: z.string(),
    carReciboArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    carDemonstrativoArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    areaAppHa: z.string(),
    areaReservaLegalHa: z.string(),
    areaVegetacaoNativaHa: z.string(),
    areaUsoRestritoHa: z.string(),
    areaConsolidadaHa: z.string(),
    praSituacao: z.string(),
    termoPraArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    sigefCertificado: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    sigefParcelaCodigo: z.string(),
    sigefDataCertificacao: z.string(),
    sigefSituacao: z.string(),
    sigefArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    memorialDescritivoArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    plantaGeorreferenciadaArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    artRrtTrtArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    responsavelTecnicoNome: z.string(),
    responsavelTecnicoRegistro: z.string(),
    possuiOnusReais: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    descricaoOnusReais: z.string(),
    certidaoOnusArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    possuiAcaoRealReipersecutoria: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    certidaoAcoesArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    tituloAquisicaoArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    cadeiaDominialVerificada: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    cadeiaDominialObservacoes: z.string(),
    possuiArrendamento: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    arrendamentoArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    possuiParceriaRural: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    parceriaRuralArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    licenciamentoAmbientalSituacao: z.string(),
    licencasAmbientaisArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    outorgaAguaSituacao: z.string(),
    outorgaAguaArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    embargoAmbiental: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    embargoAmbientalObservacoes: z.string(),
    documentacaoConferidaEm: z.string(),
    proximaRevisaoDocumental: z.string(),
    pendenciasDocumentais: z.string(),
    observacoes: z.string(),
    arquivosKml: z.string().transform((val) => val.split(' ')),
    imovel: z.string(),
  })
  .partial();

export const documentacaoRuralBrasilUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const documentacaoRuralBrasilUpdateBodyInputSchema =
  documentacaoRuralBrasilCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DocumentacaoRuralBrasilWithRelationships extends DocumentacaoRuralBrasil {
  arquivosKml?: ArquivoKml[];
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

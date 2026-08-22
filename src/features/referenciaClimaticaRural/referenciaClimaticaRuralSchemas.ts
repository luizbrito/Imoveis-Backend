import { ReferenciaClimaticaRural } from '../../prisma/generated/client';
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
import { referenciaClimaticaRuralEnumerators } from './referenciaClimaticaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const referenciaClimaticaRuralFindSchema = z.object({
  id: z.string(),
});

export const referenciaClimaticaRuralFilterInputSchema = z
  .object({
    tipoReferencia: z
      .enum(referenciaClimaticaRuralEnumerators.tipoReferencia)
      .nullable()
      .optional(),
    titulo: z.string(),
    pais: z.string(),
    estadoDepartamentoProvincia: z.string(),
    municipioDistrito: z.string(),
    regiaoClimatica: z.string(),
    precipitacaoMediaAnualMmRange: z.array(numberOptionalSchema).max(2),
    precipitacaoMinimaReferenciaMmRange: z.array(numberOptionalSchema).max(2),
    precipitacaoMaximaReferenciaMmRange: z.array(numberOptionalSchema).max(2),
    faixaPluviometrica: z.string(),
    mesMaisChuvoso: z.string(),
    mesMaisSeco: z.string(),
    inicioPeriodoChuvoso: z.string(),
    fimPeriodoChuvoso: z.string(),
    diasChuvaAnoRange: z.array(numberOptionalSchema).max(2),
    temperaturaMediaAnualCRange: z.array(numberOptionalSchema).max(2),
    temperaturaMinimaMediaCRange: z.array(numberOptionalSchema).max(2),
    temperaturaMaximaMediaCRange: z.array(numberOptionalSchema).max(2),
    riscoSeca: z
      .enum(referenciaClimaticaRuralEnumerators.riscoSeca)
      .nullable()
      .optional(),
    riscoEncharcamento: z
      .enum(referenciaClimaticaRuralEnumerators.riscoEncharcamento)
      .nullable()
      .optional(),
    riscoGeada: z
      .enum(referenciaClimaticaRuralEnumerators.riscoGeada)
      .nullable()
      .optional(),
    indiceAridezRange: z.array(numberOptionalSchema).max(2),
    periodoClimatologicoInicioRange: z.array(numberOptionalSchema).max(2),
    periodoClimatologicoFimRange: z.array(numberOptionalSchema).max(2),
    estacaoMeteorologica: z.string(),
    distanciaEstacaoKmRange: z.array(numberOptionalSchema).max(2),
    fonteDados: z.string(),
    dataConsultaRange: z.array(dateOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const referenciaClimaticaRuralFindManyInputSchema = z.object({
  filter: referenciaClimaticaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const referenciaClimaticaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referenciaClimaticaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referenciaClimaticaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referenciaClimaticaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const referenciaClimaticaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const referenciaClimaticaRuralCreateInputSchema = z.object({
  tipoReferencia: z
    .enum(referenciaClimaticaRuralEnumerators.tipoReferencia)
    .nullable()
    .optional(),
  titulo: z.string().trim().min(1).min(1).max(250),
  descricao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  pais: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  estadoDepartamentoProvincia: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  municipioDistrito: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  regiaoClimatica: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  precipitacaoMediaAnualMm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  precipitacaoMinimaReferenciaMm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  precipitacaoMaximaReferenciaMm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  faixaPluviometrica: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  mesMaisChuvoso: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  mesMaisSeco: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  inicioPeriodoChuvoso: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  fimPeriodoChuvoso: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  diasChuvaAno: numberOptionalSchema.pipe(z.int().nullable().optional()),
  temperaturaMediaAnualC: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  temperaturaMinimaMediaC: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  temperaturaMaximaMediaC: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  riscoSeca: z
    .enum(referenciaClimaticaRuralEnumerators.riscoSeca)
    .nullable()
    .optional(),
  riscoEncharcamento: z
    .enum(referenciaClimaticaRuralEnumerators.riscoEncharcamento)
    .nullable()
    .optional(),
  riscoGeada: z
    .enum(referenciaClimaticaRuralEnumerators.riscoGeada)
    .nullable()
    .optional(),
  indiceAridez: numberOptionalSchema.pipe(z.number().nullable().optional()),
  periodoClimatologicoInicio: numberOptionalSchema.pipe(
    z.int().nullable().optional(),
  ),
  periodoClimatologicoFim: numberOptionalSchema.pipe(
    z.int().nullable().optional(),
  ),
  estacaoMeteorologica: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  distanciaEstacaoKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  fonteDados: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  urlFonte: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataConsulta: dateOptionalSchema,
  mapaClimatico: z.array(fileUploadedSchema).optional(),
  arquivoDados: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const referenciaClimaticaRuralImportInputSchema =
  referenciaClimaticaRuralCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      mapaClimatico: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      arquivoDados: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const referenciaClimaticaRuralImportFileSchema = z
  .object({
    tipoReferencia: z.string(),
    titulo: z.string(),
    descricao: z.string(),
    pais: z.string(),
    estadoDepartamentoProvincia: z.string(),
    municipioDistrito: z.string(),
    regiaoClimatica: z.string(),
    precipitacaoMediaAnualMm: z.string(),
    precipitacaoMinimaReferenciaMm: z.string(),
    precipitacaoMaximaReferenciaMm: z.string(),
    faixaPluviometrica: z.string(),
    mesMaisChuvoso: z.string(),
    mesMaisSeco: z.string(),
    inicioPeriodoChuvoso: z.string(),
    fimPeriodoChuvoso: z.string(),
    diasChuvaAno: z.string(),
    temperaturaMediaAnualC: z.string(),
    temperaturaMinimaMediaC: z.string(),
    temperaturaMaximaMediaC: z.string(),
    riscoSeca: z.string(),
    riscoEncharcamento: z.string(),
    riscoGeada: z.string(),
    indiceAridez: z.string(),
    periodoClimatologicoInicio: z.string(),
    periodoClimatologicoFim: z.string(),
    estacaoMeteorologica: z.string(),
    distanciaEstacaoKm: z.string(),
    fonteDados: z.string(),
    urlFonte: z.string(),
    dataConsulta: z.string(),
    mapaClimatico: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    arquivoDados: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const referenciaClimaticaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const referenciaClimaticaRuralUpdateBodyInputSchema =
  referenciaClimaticaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ReferenciaClimaticaRuralWithRelationships extends ReferenciaClimaticaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

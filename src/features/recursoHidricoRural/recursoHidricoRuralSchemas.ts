import { RecursoHidricoRural } from '../../prisma/generated/client';
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
import { recursoHidricoRuralEnumerators } from './recursoHidricoRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const recursoHidricoRuralFindSchema = z.object({
  id: z.string(),
});

export const recursoHidricoRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(recursoHidricoRuralEnumerators.tipo).nullable().optional(),
    perene: booleanStringOptionalSchema,
    navegavel: booleanStringOptionalSchema,
    extensaoNaPropriedadeKmRange: z.array(numberOptionalSchema).max(2),
    frentePropriedadeKmRange: z.array(numberOptionalSchema).max(2),
    vazaoEstimadaRange: z.array(numberOptionalSchema).max(2),
    qualidadeAgua: z
      .enum(recursoHidricoRuralEnumerators.qualidadeAgua)
      .nullable()
      .optional(),
    sazonalidade: z
      .enum(recursoHidricoRuralEnumerators.sazonalidade)
      .nullable()
      .optional(),
    usoGado: booleanStringOptionalSchema,
    usoIrrigacao: booleanStringOptionalSchema,
    usoHumano: booleanStringOptionalSchema,
    capacidadeAbastecimentoCabecasRange: z.array(numberOptionalSchema).max(2),
    areaIrrigavelHaRange: z.array(numberOptionalSchema).max(2),
    outorgaNecessaria: booleanStringOptionalSchema,
    outorgaSituacao: z
      .enum(recursoHidricoRuralEnumerators.outorgaSituacao)
      .nullable()
      .optional(),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const recursoHidricoRuralFindManyInputSchema = z.object({
  filter: recursoHidricoRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const recursoHidricoRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const recursoHidricoRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const recursoHidricoRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const recursoHidricoRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const recursoHidricoRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const recursoHidricoRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z.enum(recursoHidricoRuralEnumerators.tipo).nullable().optional(),
  perene: z.boolean().default(false),
  navegavel: z.boolean().default(false),
  extensaoNaPropriedadeKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  frentePropriedadeKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  vazaoEstimada: numberOptionalSchema.pipe(z.number().nullable().optional()),
  unidadeVazao: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  qualidadeAgua: z
    .enum(recursoHidricoRuralEnumerators.qualidadeAgua)
    .nullable()
    .optional(),
  sazonalidade: z
    .enum(recursoHidricoRuralEnumerators.sazonalidade)
    .nullable()
    .optional(),
  usoGado: z.boolean().default(false),
  usoIrrigacao: z.boolean().default(false),
  usoHumano: z.boolean().default(false),
  capacidadeAbastecimentoCabecas: numberOptionalSchema.pipe(
    z.int().nullable().optional(),
  ),
  areaIrrigavelHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  outorgaNecessaria: z.boolean().default(false),
  outorgaSituacao: z
    .enum(recursoHidricoRuralEnumerators.outorgaSituacao)
    .nullable()
    .optional(),
  documentoOutorga: z.array(fileUploadedSchema).optional(),
  kml: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const recursoHidricoRuralImportInputSchema =
  recursoHidricoRuralCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      documentoOutorga: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
      kml: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const recursoHidricoRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    perene: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    navegavel: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    extensaoNaPropriedadeKm: z.string(),
    frentePropriedadeKm: z.string(),
    vazaoEstimada: z.string(),
    unidadeVazao: z.string(),
    qualidadeAgua: z.string(),
    sazonalidade: z.string(),
    usoGado: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    usoIrrigacao: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    usoHumano: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    capacidadeAbastecimentoCabecas: z.string(),
    areaIrrigavelHa: z.string(),
    outorgaNecessaria: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    outorgaSituacao: z.string(),
    documentoOutorga: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    kml: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const recursoHidricoRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const recursoHidricoRuralUpdateBodyInputSchema =
  recursoHidricoRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface RecursoHidricoRuralWithRelationships extends RecursoHidricoRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

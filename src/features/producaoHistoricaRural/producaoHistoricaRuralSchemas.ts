import { ProducaoHistoricaRural } from '../../prisma/generated/client';
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
import { producaoHistoricaRuralEnumerators } from './producaoHistoricaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const producaoHistoricaRuralFindSchema = z.object({
  id: z.string(),
});

export const producaoHistoricaRuralFilterInputSchema = z
  .object({
    safraAno: z.string(),
    atividade: z
      .enum(producaoHistoricaRuralEnumerators.atividade)
      .nullable()
      .optional(),
    areaHaRange: z.array(numberOptionalSchema).max(2),
    producaoTotalRange: z.array(numberOptionalSchema).max(2),
    unidadeProducao: z.string(),
    produtividadePorHaRange: z.array(numberOptionalSchema).max(2),
    cabecasMediaAnoRange: z.array(numberOptionalSchema).max(2),
    uaHaRange: z.array(numberOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const producaoHistoricaRuralFindManyInputSchema = z.object({
  filter: producaoHistoricaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const producaoHistoricaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const producaoHistoricaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const producaoHistoricaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const producaoHistoricaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ safraAno: 'asc' }),
});

export const producaoHistoricaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  safraAno: z.string(),
});

export const producaoHistoricaRuralCreateInputSchema = z.object({
  safraAno: z.string().trim().min(1).min(1).max(250),
  atividade: z
    .enum(producaoHistoricaRuralEnumerators.atividade)
    .nullable()
    .optional(),
  areaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  producaoTotal: numberOptionalSchema.pipe(z.number().nullable().optional()),
  unidadeProducao: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  produtividadePorHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  cabecasMediaAno: numberOptionalSchema.pipe(z.int().nullable().optional()),
  uaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  documentos: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const producaoHistoricaRuralImportInputSchema =
  producaoHistoricaRuralCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      documentos: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const producaoHistoricaRuralImportFileSchema = z
  .object({
    safraAno: z.string(),
    atividade: z.string(),
    areaHa: z.string(),
    producaoTotal: z.string(),
    unidadeProducao: z.string(),
    produtividadePorHa: z.string(),
    cabecasMediaAno: z.string(),
    uaHa: z.string(),
    observacoes: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const producaoHistoricaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const producaoHistoricaRuralUpdateBodyInputSchema =
  producaoHistoricaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ProducaoHistoricaRuralWithRelationships extends ProducaoHistoricaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

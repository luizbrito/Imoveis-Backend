import { RestricaoTerritorialRural } from '../../prisma/generated/client';
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
import { restricaoTerritorialRuralEnumerators } from './restricaoTerritorialRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const restricaoTerritorialRuralFindSchema = z.object({
  id: z.string(),
});

export const restricaoTerritorialRuralFilterInputSchema = z
  .object({
    tipo: z
      .enum(restricaoTerritorialRuralEnumerators.tipo)
      .nullable()
      .optional(),
    areaAfetadaHaRange: z.array(numberOptionalSchema).max(2),
    extensaoKmRange: z.array(numberOptionalSchema).max(2),
    impacto: z
      .enum(restricaoTerritorialRuralEnumerators.impacto)
      .nullable()
      .optional(),
    regularizada: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const restricaoTerritorialRuralFindManyInputSchema = z.object({
  filter: restricaoTerritorialRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const restricaoTerritorialRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const restricaoTerritorialRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const restricaoTerritorialRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const restricaoTerritorialRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ tipo: 'asc' }),
});

export const restricaoTerritorialRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  tipo: z.string(),
});

export const restricaoTerritorialRuralCreateInputSchema = z.object({
  tipo: z.enum(restricaoTerritorialRuralEnumerators.tipo),
  descricao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  areaAfetadaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  extensaoKm: numberOptionalSchema.pipe(z.number().nullable().optional()),
  impacto: z
    .enum(restricaoTerritorialRuralEnumerators.impacto)
    .nullable()
    .optional(),
  regularizada: z.boolean().default(false),
  documentos: z.array(fileUploadedSchema).optional(),
  kml: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const restricaoTerritorialRuralImportInputSchema =
  restricaoTerritorialRuralCreateInputSchema
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
      kml: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const restricaoTerritorialRuralImportFileSchema = z
  .object({
    tipo: z.string(),
    descricao: z.string(),
    areaAfetadaHa: z.string(),
    extensaoKm: z.string(),
    impacto: z.string(),
    regularizada: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    kml: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const restricaoTerritorialRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const restricaoTerritorialRuralUpdateBodyInputSchema =
  restricaoTerritorialRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface RestricaoTerritorialRuralWithRelationships extends RestricaoTerritorialRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { TopografiaRural } from '../../prisma/generated/client';
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
import { topografiaRuralEnumerators } from './topografiaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const topografiaRuralFindSchema = z.object({
  id: z.string(),
});

export const topografiaRuralFilterInputSchema = z
  .object({
    descricao: z.string(),
    tipoRelevo: z
      .enum(topografiaRuralEnumerators.tipoRelevo)
      .nullable()
      .optional(),
    altitudeMinimaMRange: z.array(numberOptionalSchema).max(2),
    altitudeMaximaMRange: z.array(numberOptionalSchema).max(2),
    altitudeMediaMRange: z.array(numberOptionalSchema).max(2),
    declividadeMediaPercentualRange: z.array(numberOptionalSchema).max(2),
    declividadeMaximaPercentualRange: z.array(numberOptionalSchema).max(2),
    areaPlanaPercentualRange: z.array(numberOptionalSchema).max(2),
    areaOnduladaPercentualRange: z.array(numberOptionalSchema).max(2),
    riscoErosao: z
      .enum(topografiaRuralEnumerators.riscoErosao)
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

export const topografiaRuralFindManyInputSchema = z.object({
  filter: topografiaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const topografiaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const topografiaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const topografiaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const topografiaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ descricao: 'asc' }),
});

export const topografiaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  descricao: z.string(),
});

export const topografiaRuralCreateInputSchema = z.object({
  descricao: z.string().trim().min(1).min(1).max(250),
  tipoRelevo: z
    .enum(topografiaRuralEnumerators.tipoRelevo)
    .nullable()
    .optional(),
  altitudeMinimaM: numberOptionalSchema.pipe(z.number().nullable().optional()),
  altitudeMaximaM: numberOptionalSchema.pipe(z.number().nullable().optional()),
  altitudeMediaM: numberOptionalSchema.pipe(z.number().nullable().optional()),
  declividadeMediaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  declividadeMaximaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaPlanaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  areaOnduladaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  riscoErosao: z
    .enum(topografiaRuralEnumerators.riscoErosao)
    .nullable()
    .optional(),
  mapaTopografico: z.array(fileUploadedSchema).optional(),
  arquivoDem: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const topografiaRuralImportInputSchema = topografiaRuralCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    mapaTopografico: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    arquivoDem: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const topografiaRuralImportFileSchema = z
  .object({
    descricao: z.string(),
    tipoRelevo: z.string(),
    altitudeMinimaM: z.string(),
    altitudeMaximaM: z.string(),
    altitudeMediaM: z.string(),
    declividadeMediaPercentual: z.string(),
    declividadeMaximaPercentual: z.string(),
    areaPlanaPercentual: z.string(),
    areaOnduladaPercentual: z.string(),
    riscoErosao: z.string(),
    mapaTopografico: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    arquivoDem: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const topografiaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const topografiaRuralUpdateBodyInputSchema =
  topografiaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface TopografiaRuralWithRelationships extends TopografiaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

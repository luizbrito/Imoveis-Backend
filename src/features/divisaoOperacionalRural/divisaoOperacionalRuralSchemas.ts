import { DivisaoOperacionalRural } from '../../prisma/generated/client';
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
import { divisaoOperacionalRuralEnumerators } from './divisaoOperacionalRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const divisaoOperacionalRuralFindSchema = z.object({
  id: z.string(),
});

export const divisaoOperacionalRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(divisaoOperacionalRuralEnumerators.tipo).nullable().optional(),
    areaHaRange: z.array(numberOptionalSchema).max(2),
    usoAtual: z.string(),
    capacidadeCabecasRange: z.array(numberOptionalSchema).max(2),
    cercaTipo: z.string(),
    cercaEstado: z
      .enum(divisaoOperacionalRuralEnumerators.cercaEstado)
      .nullable()
      .optional(),
    bebedouro: booleanStringOptionalSchema,
    cocho: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const divisaoOperacionalRuralFindManyInputSchema = z.object({
  filter: divisaoOperacionalRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const divisaoOperacionalRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const divisaoOperacionalRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const divisaoOperacionalRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const divisaoOperacionalRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const divisaoOperacionalRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const divisaoOperacionalRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z.enum(divisaoOperacionalRuralEnumerators.tipo).nullable().optional(),
  areaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  usoAtual: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  capacidadeCabecas: numberOptionalSchema.pipe(z.int().nullable().optional()),
  cercaTipo: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cercaEstado: z
    .enum(divisaoOperacionalRuralEnumerators.cercaEstado)
    .nullable()
    .optional(),
  bebedouro: z.boolean().default(false),
  cocho: z.boolean().default(false),
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

export const divisaoOperacionalRuralImportInputSchema =
  divisaoOperacionalRuralCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      kml: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const divisaoOperacionalRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    areaHa: z.string(),
    usoAtual: z.string(),
    capacidadeCabecas: z.string(),
    cercaTipo: z.string(),
    cercaEstado: z.string(),
    bebedouro: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    cocho: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    kml: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const divisaoOperacionalRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const divisaoOperacionalRuralUpdateBodyInputSchema =
  divisaoOperacionalRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DivisaoOperacionalRuralWithRelationships extends DivisaoOperacionalRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

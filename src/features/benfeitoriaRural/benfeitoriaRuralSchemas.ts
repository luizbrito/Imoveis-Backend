import { BenfeitoriaRural } from '../../prisma/generated/client';
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
import { benfeitoriaRuralEnumerators } from './benfeitoriaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const benfeitoriaRuralFindSchema = z.object({
  id: z.string(),
});

export const benfeitoriaRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(benfeitoriaRuralEnumerators.tipo).nullable().optional(),
    quantidadeRange: z.array(numberOptionalSchema).max(2),
    areaConstruidaM2Range: z.array(numberOptionalSchema).max(2),
    anoConstrucaoRange: z.array(numberOptionalSchema).max(2),
    estadoConservacao: z
      .enum(benfeitoriaRuralEnumerators.estadoConservacao)
      .nullable()
      .optional(),
    valorEstimadoRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(benfeitoriaRuralEnumerators.moeda).nullable().optional(),
    incluidaVenda: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const benfeitoriaRuralFindManyInputSchema = z.object({
  filter: benfeitoriaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const benfeitoriaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const benfeitoriaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const benfeitoriaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const benfeitoriaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const benfeitoriaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const benfeitoriaRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z.enum(benfeitoriaRuralEnumerators.tipo).nullable().optional(),
  quantidade: numberOptionalSchema.pipe(z.int().nullable().optional()),
  areaConstruidaM2: numberOptionalSchema.pipe(z.number().nullable().optional()),
  anoConstrucao: numberOptionalSchema.pipe(z.int().nullable().optional()),
  estadoConservacao: z
    .enum(benfeitoriaRuralEnumerators.estadoConservacao)
    .nullable()
    .optional(),
  valorEstimado: numberOptionalSchema.pipe(z.number().nullable().optional()),
  moeda: z.enum(benfeitoriaRuralEnumerators.moeda).nullable().optional(),
  incluidaVenda: z.boolean().default(false),
  fotos: z.array(fileUploadedSchema).optional(),
  documentos: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const benfeitoriaRuralImportInputSchema =
  benfeitoriaRuralCreateInputSchema.extend(importerInputSchema.shape).extend({
    fotos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    documentos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const benfeitoriaRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    quantidade: z.string(),
    areaConstruidaM2: z.string(),
    anoConstrucao: z.string(),
    estadoConservacao: z.string(),
    valorEstimado: z.string(),
    moeda: z.string(),
    incluidaVenda: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    fotos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const benfeitoriaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const benfeitoriaRuralUpdateBodyInputSchema =
  benfeitoriaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface BenfeitoriaRuralWithRelationships extends BenfeitoriaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

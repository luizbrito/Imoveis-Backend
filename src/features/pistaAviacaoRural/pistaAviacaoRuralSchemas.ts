import { PistaAviacaoRural } from '../../prisma/generated/client';
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
import { pistaAviacaoRuralEnumerators } from './pistaAviacaoRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const pistaAviacaoRuralFindSchema = z.object({
  id: z.string(),
});

export const pistaAviacaoRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    habilitada: booleanStringOptionalSchema,
    situacaoHabilitacao: z
      .enum(pistaAviacaoRuralEnumerators.situacaoHabilitacao)
      .nullable()
      .optional(),
    comprimentoMRange: z.array(numberOptionalSchema).max(2),
    larguraMRange: z.array(numberOptionalSchema).max(2),
    tipoPiso: z
      .enum(pistaAviacaoRuralEnumerators.tipoPiso)
      .nullable()
      .optional(),
    orientacao: z.string(),
    latitudeRange: z.array(numberOptionalSchema).max(2),
    longitudeRange: z.array(numberOptionalSchema).max(2),
    usoNoturno: booleanStringOptionalSchema,
    hangar: booleanStringOptionalSchema,
    combustivelDisponivel: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const pistaAviacaoRuralFindManyInputSchema = z.object({
  filter: pistaAviacaoRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const pistaAviacaoRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pistaAviacaoRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pistaAviacaoRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pistaAviacaoRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const pistaAviacaoRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const pistaAviacaoRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  habilitada: z.boolean().default(false),
  situacaoHabilitacao: z
    .enum(pistaAviacaoRuralEnumerators.situacaoHabilitacao)
    .nullable()
    .optional(),
  comprimentoM: numberOptionalSchema.pipe(z.number().nullable().optional()),
  larguraM: numberOptionalSchema.pipe(z.number().nullable().optional()),
  tipoPiso: z.enum(pistaAviacaoRuralEnumerators.tipoPiso).nullable().optional(),
  orientacao: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  latitude: numberOptionalSchema.pipe(z.number().nullable().optional()),
  longitude: numberOptionalSchema.pipe(z.number().nullable().optional()),
  usoNoturno: z.boolean().default(false),
  hangar: z.boolean().default(false),
  combustivelDisponivel: z.boolean().default(false),
  documentoHabilitacao: z.array(fileUploadedSchema).optional(),
  fotos: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const pistaAviacaoRuralImportInputSchema =
  pistaAviacaoRuralCreateInputSchema.extend(importerInputSchema.shape).extend({
    documentoHabilitacao: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    fotos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const pistaAviacaoRuralImportFileSchema = z
  .object({
    nome: z.string(),
    habilitada: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    situacaoHabilitacao: z.string(),
    comprimentoM: z.string(),
    larguraM: z.string(),
    tipoPiso: z.string(),
    orientacao: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    usoNoturno: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    hangar: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    combustivelDisponivel: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    documentoHabilitacao: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    fotos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const pistaAviacaoRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const pistaAviacaoRuralUpdateBodyInputSchema =
  pistaAviacaoRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PistaAviacaoRuralWithRelationships extends PistaAviacaoRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

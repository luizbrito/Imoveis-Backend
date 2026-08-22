import { LogisticaRural } from '../../prisma/generated/client';
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
import { MemberWithRelationships } from '../member/memberSchemas';
import { logisticaRuralEnumerators } from './logisticaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const logisticaRuralFindSchema = z.object({
  id: z.string(),
});

export const logisticaRuralFilterInputSchema = z
  .object({
    descricao: z.string(),
    tipoAcessoPrincipal: z
      .enum(logisticaRuralEnumerators.tipoAcessoPrincipal)
      .nullable()
      .optional(),
    distanciaAsfaltoKmRange: z.array(numberOptionalSchema).max(2),
    transitavelAnoTodo: booleanStringOptionalSchema,
    restricaoEpocaChuva: booleanStringOptionalSchema,
    acessoCaminhaoBitrem: booleanStringOptionalSchema,
    acessoRodotrem: booleanStringOptionalSchema,
    distanciaCidadeKmRange: z.array(numberOptionalSchema).max(2),
    distanciaSiloKmRange: z.array(numberOptionalSchema).max(2),
    distanciaFrigorificoKmRange: z.array(numberOptionalSchema).max(2),
    distanciaCooperativaKmRange: z.array(numberOptionalSchema).max(2),
    distanciaPortoKmRange: z.array(numberOptionalSchema).max(2),
    distanciaFerroviaKmRange: z.array(numberOptionalSchema).max(2),
    distanciaAeroportoKmRange: z.array(numberOptionalSchema).max(2),
    distanciaRodoviaPrincipalKmRange: z.array(numberOptionalSchema).max(2),
    pontesInternasRange: z.array(numberOptionalSchema).max(2),
    estradasInternasKmRange: z.array(numberOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const logisticaRuralFindManyInputSchema = z.object({
  filter: logisticaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const logisticaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const logisticaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const logisticaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const logisticaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ descricao: 'asc' }),
});

export const logisticaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  descricao: z.string(),
});

export const logisticaRuralCreateInputSchema = z.object({
  descricao: z.string().trim().min(1).min(1).max(250),
  tipoAcessoPrincipal: z
    .enum(logisticaRuralEnumerators.tipoAcessoPrincipal)
    .nullable()
    .optional(),
  distanciaAsfaltoKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  transitavelAnoTodo: z.boolean().default(false),
  restricaoEpocaChuva: z.boolean().default(false),
  acessoCaminhaoBitrem: z.boolean().default(false),
  acessoRodotrem: z.boolean().default(false),
  distanciaCidadeKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  distanciaSiloKm: numberOptionalSchema.pipe(z.number().nullable().optional()),
  distanciaFrigorificoKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  distanciaCooperativaKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  distanciaPortoKm: numberOptionalSchema.pipe(z.number().nullable().optional()),
  distanciaFerroviaKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  distanciaAeroportoKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  distanciaRodoviaPrincipalKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  pontesInternas: numberOptionalSchema.pipe(z.int().nullable().optional()),
  estradasInternasKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const logisticaRuralImportInputSchema =
  logisticaRuralCreateInputSchema.extend(importerInputSchema.shape);

export const logisticaRuralImportFileSchema = z
  .object({
    descricao: z.string(),
    tipoAcessoPrincipal: z.string(),
    distanciaAsfaltoKm: z.string(),
    transitavelAnoTodo: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    restricaoEpocaChuva: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    acessoCaminhaoBitrem: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    acessoRodotrem: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    distanciaCidadeKm: z.string(),
    distanciaSiloKm: z.string(),
    distanciaFrigorificoKm: z.string(),
    distanciaCooperativaKm: z.string(),
    distanciaPortoKm: z.string(),
    distanciaFerroviaKm: z.string(),
    distanciaAeroportoKm: z.string(),
    distanciaRodoviaPrincipalKm: z.string(),
    pontesInternas: z.string(),
    estradasInternasKm: z.string(),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const logisticaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const logisticaRuralUpdateBodyInputSchema =
  logisticaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface LogisticaRuralWithRelationships extends LogisticaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

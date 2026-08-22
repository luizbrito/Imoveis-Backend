import { CondicaoComercialRural } from '../../prisma/generated/client';
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
import { condicaoComercialRuralEnumerators } from './condicaoComercialRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const condicaoComercialRuralFindSchema = z.object({
  id: z.string(),
});

export const condicaoComercialRuralFilterInputSchema = z
  .object({
    precoPorHaRange: z.array(numberOptionalSchema).max(2),
    moeda: z
      .enum(condicaoComercialRuralEnumerators.moeda)
      .nullable()
      .optional(),
    valorTotalRange: z.array(numberOptionalSchema).max(2),
    aceitaParcelamento: booleanStringOptionalSchema,
    percentualEntradaRange: z.array(numberOptionalSchema).max(2),
    numeroParcelasRange: z.array(numberOptionalSchema).max(2),
    aceitaPermuta: booleanStringOptionalSchema,
    aceitaFinanciamento: booleanStringOptionalSchema,
    comissaoImobiliariaPercentualRange: z.array(numberOptionalSchema).max(2),
    comissaoCorretorPercentualRange: z.array(numberOptionalSchema).max(2),
    exclusividade: booleanStringOptionalSchema,
    dataInicioExclusividadeRange: z.array(dateOptionalSchema).max(2),
    dataFimExclusividadeRange: z.array(dateOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const condicaoComercialRuralFindManyInputSchema = z.object({
  filter: condicaoComercialRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const condicaoComercialRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoComercialRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoComercialRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoComercialRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ precoPorHa: 'asc' }),
});

export const condicaoComercialRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  precoPorHa: z.string(),
});

export const condicaoComercialRuralCreateInputSchema = z.object({
  precoPorHa: numberSchema.pipe(z.number()),
  moeda: z.enum(condicaoComercialRuralEnumerators.moeda).nullable().optional(),
  valorTotal: numberOptionalSchema.pipe(z.number().nullable().optional()),
  aceitaParcelamento: z.boolean().default(false),
  percentualEntrada: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  numeroParcelas: numberOptionalSchema.pipe(z.int().nullable().optional()),
  aceitaPermuta: z.boolean().default(false),
  aceitaFinanciamento: z.boolean().default(false),
  comissaoImobiliariaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  comissaoCorretorPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  exclusividade: z.boolean().default(false),
  dataInicioExclusividade: dateOptionalSchema,
  dataFimExclusividade: dateOptionalSchema,
  motivoVenda: z
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

export const condicaoComercialRuralImportInputSchema =
  condicaoComercialRuralCreateInputSchema.extend(importerInputSchema.shape);

export const condicaoComercialRuralImportFileSchema = z
  .object({
    precoPorHa: z.string(),
    moeda: z.string(),
    valorTotal: z.string(),
    aceitaParcelamento: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    percentualEntrada: z.string(),
    numeroParcelas: z.string(),
    aceitaPermuta: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    aceitaFinanciamento: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    comissaoImobiliariaPercentual: z.string(),
    comissaoCorretorPercentual: z.string(),
    exclusividade: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    dataInicioExclusividade: z.string(),
    dataFimExclusividade: z.string(),
    motivoVenda: z.string(),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const condicaoComercialRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const condicaoComercialRuralUpdateBodyInputSchema =
  condicaoComercialRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CondicaoComercialRuralWithRelationships extends CondicaoComercialRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { SistemaProdutivoRural } from '../../prisma/generated/client';
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
import { sistemaProdutivoRuralEnumerators } from './sistemaProdutivoRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const sistemaProdutivoRuralFindSchema = z.object({
  id: z.string(),
});

export const sistemaProdutivoRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(sistemaProdutivoRuralEnumerators.tipo).nullable().optional(),
    areaHaRange: z.array(numberOptionalSchema).max(2),
    irrigado: booleanStringOptionalSchema,
    tipoIrrigacao: z
      .enum(sistemaProdutivoRuralEnumerators.tipoIrrigacao)
      .nullable()
      .optional(),
    quantidadePivosRange: z.array(numberOptionalSchema).max(2),
    areaIrrigadaHaRange: z.array(numberOptionalSchema).max(2),
    fonteAgua: z.string(),
    capacidadeIrrigacaoHaRange: z.array(numberOptionalSchema).max(2),
    certificadoOrganico: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const sistemaProdutivoRuralFindManyInputSchema = z.object({
  filter: sistemaProdutivoRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const sistemaProdutivoRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const sistemaProdutivoRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const sistemaProdutivoRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const sistemaProdutivoRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const sistemaProdutivoRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const sistemaProdutivoRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z.enum(sistemaProdutivoRuralEnumerators.tipo).nullable().optional(),
  areaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  irrigado: z.boolean().default(false),
  tipoIrrigacao: z
    .enum(sistemaProdutivoRuralEnumerators.tipoIrrigacao)
    .nullable()
    .optional(),
  quantidadePivos: numberOptionalSchema.pipe(z.int().nullable().optional()),
  areaIrrigadaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  fonteAgua: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  capacidadeIrrigacaoHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  certificadoOrganico: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const sistemaProdutivoRuralImportInputSchema =
  sistemaProdutivoRuralCreateInputSchema.extend(importerInputSchema.shape);

export const sistemaProdutivoRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    areaHa: z.string(),
    irrigado: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    tipoIrrigacao: z.string(),
    quantidadePivos: z.string(),
    areaIrrigadaHa: z.string(),
    fonteAgua: z.string(),
    capacidadeIrrigacaoHa: z.string(),
    certificadoOrganico: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const sistemaProdutivoRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const sistemaProdutivoRuralUpdateBodyInputSchema =
  sistemaProdutivoRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SistemaProdutivoRuralWithRelationships extends SistemaProdutivoRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

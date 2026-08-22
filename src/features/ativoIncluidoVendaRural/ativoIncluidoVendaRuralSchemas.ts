import { AtivoIncluidoVendaRural } from '../../prisma/generated/client';
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
import { ativoIncluidoVendaRuralEnumerators } from './ativoIncluidoVendaRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const ativoIncluidoVendaRuralFindSchema = z.object({
  id: z.string(),
});

export const ativoIncluidoVendaRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(ativoIncluidoVendaRuralEnumerators.tipo).nullable().optional(),
    quantidadeRange: z.array(numberOptionalSchema).max(2),
    valorEstimadoRange: z.array(numberOptionalSchema).max(2),
    moeda: z
      .enum(ativoIncluidoVendaRuralEnumerators.moeda)
      .nullable()
      .optional(),
    incluidoPreco: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const ativoIncluidoVendaRuralFindManyInputSchema = z.object({
  filter: ativoIncluidoVendaRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const ativoIncluidoVendaRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ativoIncluidoVendaRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ativoIncluidoVendaRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ativoIncluidoVendaRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const ativoIncluidoVendaRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const ativoIncluidoVendaRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z.enum(ativoIncluidoVendaRuralEnumerators.tipo).nullable().optional(),
  descricao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  quantidade: numberOptionalSchema.pipe(z.number().nullable().optional()),
  valorEstimado: numberOptionalSchema.pipe(z.number().nullable().optional()),
  moeda: z.enum(ativoIncluidoVendaRuralEnumerators.moeda).nullable().optional(),
  incluidoPreco: z.boolean().default(false),
  documentos: z.array(fileUploadedSchema).optional(),
  fotos: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const ativoIncluidoVendaRuralImportInputSchema =
  ativoIncluidoVendaRuralCreateInputSchema
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
      fotos: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const ativoIncluidoVendaRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    descricao: z.string(),
    quantidade: z.string(),
    valorEstimado: z.string(),
    moeda: z.string(),
    incluidoPreco: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    fotos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const ativoIncluidoVendaRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const ativoIncluidoVendaRuralUpdateBodyInputSchema =
  ativoIncluidoVendaRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface AtivoIncluidoVendaRuralWithRelationships extends AtivoIncluidoVendaRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

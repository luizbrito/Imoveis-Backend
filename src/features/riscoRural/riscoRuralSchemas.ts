import { RiscoRural } from '../../prisma/generated/client';
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
import { riscoRuralEnumerators } from './riscoRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const riscoRuralFindSchema = z.object({
  id: z.string(),
});

export const riscoRuralFilterInputSchema = z
  .object({
    tipo: z.enum(riscoRuralEnumerators.tipo).nullable().optional(),
    nivel: z.enum(riscoRuralEnumerators.nivel).nullable().optional(),
    historicoOcorrencia: booleanStringOptionalSchema,
    ultimaOcorrenciaRange: z.array(dateOptionalSchema).max(2),
    areaAfetadaHaRange: z.array(numberOptionalSchema).max(2),
    mitigacaoExistente: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const riscoRuralFindManyInputSchema = z.object({
  filter: riscoRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const riscoRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const riscoRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const riscoRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const riscoRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ tipo: 'asc' }),
});

export const riscoRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  tipo: z.string(),
});

export const riscoRuralCreateInputSchema = z.object({
  tipo: z.enum(riscoRuralEnumerators.tipo),
  nivel: z.enum(riscoRuralEnumerators.nivel).nullable().optional(),
  descricao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  historicoOcorrencia: z.boolean().default(false),
  ultimaOcorrencia: dateOptionalSchema,
  areaAfetadaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  mitigacaoExistente: z.boolean().default(false),
  descricaoMitigacao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  documentos: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const riscoRuralImportInputSchema = riscoRuralCreateInputSchema
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

export const riscoRuralImportFileSchema = z
  .object({
    tipo: z.string(),
    nivel: z.string(),
    descricao: z.string(),
    historicoOcorrencia: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    ultimaOcorrencia: z.string(),
    areaAfetadaHa: z.string(),
    mitigacaoExistente: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    descricaoMitigacao: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const riscoRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const riscoRuralUpdateBodyInputSchema = riscoRuralCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface RiscoRuralWithRelationships extends RiscoRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

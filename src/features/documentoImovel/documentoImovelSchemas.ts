import { DocumentoImovel } from '../../prisma/generated/client';
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
import { documentoImovelEnumerators } from './documentoImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const documentoImovelFindSchema = z.object({
  id: z.string(),
});

export const documentoImovelFilterInputSchema = z
  .object({
    titulo: z.string(),
    tipo: z.enum(documentoImovelEnumerators.tipo).nullable().optional(),
    numeroDocumento: z.string(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataValidadeRange: z.array(dateOptionalSchema).max(2),
    visibilidade: z
      .enum(documentoImovelEnumerators.visibilidade)
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

export const documentoImovelFindManyInputSchema = z.object({
  filter: documentoImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const documentoImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const documentoImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const documentoImovelCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(documentoImovelEnumerators.tipo),
  numeroDocumento: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataEmissao: dateOptionalSchema,
  dataValidade: dateOptionalSchema,
  arquivos: z.array(fileUploadedSchema).min(1).max(10),
  visibilidade: z.enum(documentoImovelEnumerators.visibilidade),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const documentoImovelImportInputSchema = documentoImovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    arquivos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const documentoImovelImportFileSchema = z
  .object({
    titulo: z.string(),
    tipo: z.string(),
    numeroDocumento: z.string(),
    dataEmissao: z.string(),
    dataValidade: z.string(),
    arquivos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    visibilidade: z.string(),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const documentoImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const documentoImovelUpdateBodyInputSchema =
  documentoImovelCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DocumentoImovelWithRelationships extends DocumentoImovel {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

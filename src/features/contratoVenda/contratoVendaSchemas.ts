import { ContratoVenda } from '../../prisma/generated/client';
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
import { contratoVendaEnumerators } from './contratoVendaEnumerators';
import { Venda } from '../../prisma/generated/client';

export const contratoVendaFindSchema = z.object({
  id: z.string(),
});

export const contratoVendaFilterInputSchema = z
  .object({
    numero: z.string(),
    tipo: z.enum(contratoVendaEnumerators.tipo).nullable().optional(),
    status: z.enum(contratoVendaEnumerators.status).nullable().optional(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataAssinaturaRange: z.array(dateOptionalSchema).max(2),
    dataRegistroRange: z.array(dateOptionalSchema).max(2),
    assinaturaEletronicaId: z.string(),
    venda: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const contratoVendaFindManyInputSchema = z.object({
  filter: contratoVendaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const contratoVendaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoVendaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoVendaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoVendaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ numero: 'asc' }),
});

export const contratoVendaAutocompleteOutputSchema = z.object({
  id: z.string(),
  numero: z.string(),
});

export const contratoVendaCreateInputSchema = z.object({
  numero: z.string().trim().min(1).min(1).max(60),
  tipo: z.enum(contratoVendaEnumerators.tipo),
  status: z.enum(contratoVendaEnumerators.status),
  dataEmissao: dateOptionalSchema,
  dataAssinatura: dateOptionalSchema,
  dataRegistro: dateOptionalSchema,
  arquivos: z.array(fileUploadedSchema).max(20).optional(),
  assinaturaEletronicaId: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  venda: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const contratoVendaImportInputSchema = contratoVendaCreateInputSchema
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

export const contratoVendaImportFileSchema = z
  .object({
    numero: z.string(),
    tipo: z.string(),
    status: z.string(),
    dataEmissao: z.string(),
    dataAssinatura: z.string(),
    dataRegistro: z.string(),
    arquivos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    assinaturaEletronicaId: z.string(),
    observacoes: z.string(),
    venda: z.string(),
  })
  .partial();

export const contratoVendaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const contratoVendaUpdateBodyInputSchema = contratoVendaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ContratoVendaWithRelationships extends ContratoVenda {
  venda?: Venda;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

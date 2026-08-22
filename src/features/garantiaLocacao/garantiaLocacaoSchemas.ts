import { GarantiaLocacao } from '../../prisma/generated/client';
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
import { garantiaLocacaoEnumerators } from './garantiaLocacaoEnumerators';
import { Locacao } from '../../prisma/generated/client';

export const garantiaLocacaoFindSchema = z.object({
  id: z.string(),
});

export const garantiaLocacaoFilterInputSchema = z
  .object({
    tipo: z.enum(garantiaLocacaoEnumerators.tipo).nullable().optional(),
    status: z.enum(garantiaLocacaoEnumerators.status).nullable().optional(),
    valorGarantiaRange: z.array(numberOptionalSchema).max(2),
    garantidorNome: z.string(),
    garantidorCpfCnpj: z.string(),
    seguradora: z.string(),
    numeroApolice: z.string(),
    validadeAteRange: z.array(dateOptionalSchema).max(2),
    locacao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const garantiaLocacaoFindManyInputSchema = z.object({
  filter: garantiaLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const garantiaLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const garantiaLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const garantiaLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const garantiaLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ tipo: 'asc' }),
});

export const garantiaLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  tipo: z.string(),
});

export const garantiaLocacaoCreateInputSchema = z.object({
  tipo: z.enum(garantiaLocacaoEnumerators.tipo),
  status: z.enum(garantiaLocacaoEnumerators.status),
  valorGarantia: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  garantidorNome: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  garantidorCpfCnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  seguradora: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  numeroApolice: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  validadeAte: dateOptionalSchema,
  documentos: z.array(fileUploadedSchema).max(15).optional(),
  observacoes: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  locacao: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const garantiaLocacaoImportInputSchema = garantiaLocacaoCreateInputSchema
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

export const garantiaLocacaoImportFileSchema = z
  .object({
    tipo: z.string(),
    status: z.string(),
    valorGarantia: z.string(),
    garantidorNome: z.string(),
    garantidorCpfCnpj: z.string(),
    seguradora: z.string(),
    numeroApolice: z.string(),
    validadeAte: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    locacao: z.string(),
  })
  .partial();

export const garantiaLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const garantiaLocacaoUpdateBodyInputSchema =
  garantiaLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface GarantiaLocacaoWithRelationships extends GarantiaLocacao {
  locacao?: Locacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

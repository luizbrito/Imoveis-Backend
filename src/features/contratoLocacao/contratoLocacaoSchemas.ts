import { ContratoLocacao } from '../../prisma/generated/client';
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
import { contratoLocacaoEnumerators } from './contratoLocacaoEnumerators';
import { Locacao } from '../../prisma/generated/client';

export const contratoLocacaoFindSchema = z.object({
  id: z.string(),
});

export const contratoLocacaoFilterInputSchema = z
  .object({
    numero: z.string(),
    tipo: z.enum(contratoLocacaoEnumerators.tipo).nullable().optional(),
    status: z.enum(contratoLocacaoEnumerators.status).nullable().optional(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataAssinaturaRange: z.array(dateOptionalSchema).max(2),
    assinaturaEletronicaId: z.string(),
    locacao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const contratoLocacaoFindManyInputSchema = z.object({
  filter: contratoLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const contratoLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ numero: 'asc' }),
});

export const contratoLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  numero: z.string(),
});

export const contratoLocacaoCreateInputSchema = z.object({
  numero: z.string().trim().min(1).min(1).max(60),
  tipo: z.enum(contratoLocacaoEnumerators.tipo),
  status: z.enum(contratoLocacaoEnumerators.status),
  dataEmissao: dateOptionalSchema,
  dataAssinatura: dateOptionalSchema,
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
  locacao: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const contratoLocacaoImportInputSchema = contratoLocacaoCreateInputSchema
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

export const contratoLocacaoImportFileSchema = z
  .object({
    numero: z.string(),
    tipo: z.string(),
    status: z.string(),
    dataEmissao: z.string(),
    dataAssinatura: z.string(),
    arquivos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    assinaturaEletronicaId: z.string(),
    observacoes: z.string(),
    locacao: z.string(),
  })
  .partial();

export const contratoLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const contratoLocacaoUpdateBodyInputSchema =
  contratoLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ContratoLocacaoWithRelationships extends ContratoLocacao {
  locacao?: Locacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

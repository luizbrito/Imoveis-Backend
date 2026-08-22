import { PagamentoLocacao } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import { dateOptionalSchema } from '../../shared/schemas/dateSchema';
import {
  dateTimeOptionalSchema,
  dateTimeSchema,
} from '../../shared/schemas/dateTimeSchema';
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
import { pagamentoLocacaoEnumerators } from './pagamentoLocacaoEnumerators';
import { CobrancaLocacao } from '../../prisma/generated/client';

export const pagamentoLocacaoFindSchema = z.object({
  id: z.string(),
});

export const pagamentoLocacaoFilterInputSchema = z
  .object({
    dataPagamentoRange: z.array(dateTimeOptionalSchema).max(2),
    valorPagoRange: z.array(numberOptionalSchema).max(2),
    formaPagamento: z
      .enum(pagamentoLocacaoEnumerators.formaPagamento)
      .nullable()
      .optional(),
    identificadorTransacao: z.string(),
    status: z.enum(pagamentoLocacaoEnumerators.status).nullable().optional(),
    cobranca: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const pagamentoLocacaoFindManyInputSchema = z.object({
  filter: pagamentoLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const pagamentoLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ identificadorTransacao: 'asc' }),
});

export const pagamentoLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  identificadorTransacao: z.string(),
});

export const pagamentoLocacaoCreateInputSchema = z.object({
  dataPagamento: dateTimeSchema,
  valorPago: numberSchema.pipe(z.number().min(0)),
  formaPagamento: z.enum(pagamentoLocacaoEnumerators.formaPagamento),
  identificadorTransacao: z.string().trim().min(1).min(1).max(180),
  status: z.enum(pagamentoLocacaoEnumerators.status),
  comprovantes: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cobranca: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const pagamentoLocacaoImportInputSchema =
  pagamentoLocacaoCreateInputSchema.extend(importerInputSchema.shape).extend({
    comprovantes: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const pagamentoLocacaoImportFileSchema = z
  .object({
    dataPagamento: z.string(),
    valorPago: z.string(),
    formaPagamento: z.string(),
    identificadorTransacao: z.string(),
    status: z.string(),
    comprovantes: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    cobranca: z.string(),
  })
  .partial();

export const pagamentoLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const pagamentoLocacaoUpdateBodyInputSchema =
  pagamentoLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PagamentoLocacaoWithRelationships extends PagamentoLocacao {
  cobranca?: CobrancaLocacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

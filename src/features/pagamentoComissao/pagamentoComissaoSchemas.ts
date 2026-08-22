import { PagamentoComissao } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import {
  dateOptionalSchema,
  dateSchema,
} from '../../shared/schemas/dateSchema';
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
import { pagamentoComissaoEnumerators } from './pagamentoComissaoEnumerators';
import { Comissao } from '../../prisma/generated/client';

export const pagamentoComissaoFindSchema = z.object({
  id: z.string(),
});

export const pagamentoComissaoFilterInputSchema = z
  .object({
    dataPagamentoRange: z.array(dateOptionalSchema).max(2),
    valorRange: z.array(numberOptionalSchema).max(2),
    formaPagamento: z
      .enum(pagamentoComissaoEnumerators.formaPagamento)
      .nullable()
      .optional(),
    status: z.enum(pagamentoComissaoEnumerators.status).nullable().optional(),
    comissao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const pagamentoComissaoFindManyInputSchema = z.object({
  filter: pagamentoComissaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const pagamentoComissaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoComissaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoComissaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const pagamentoComissaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ dataPagamento: 'asc' }),
});

export const pagamentoComissaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  dataPagamento: z.string(),
});

export const pagamentoComissaoCreateInputSchema = z.object({
  dataPagamento: dateSchema,
  valor: numberSchema.pipe(z.number().min(0)),
  formaPagamento: z.enum(pagamentoComissaoEnumerators.formaPagamento),
  status: z.enum(pagamentoComissaoEnumerators.status),
  comprovante: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  comissao: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const pagamentoComissaoImportInputSchema =
  pagamentoComissaoCreateInputSchema.extend(importerInputSchema.shape).extend({
    comprovante: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const pagamentoComissaoImportFileSchema = z
  .object({
    dataPagamento: z.string(),
    valor: z.string(),
    formaPagamento: z.string(),
    status: z.string(),
    comprovante: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    comissao: z.string(),
  })
  .partial();

export const pagamentoComissaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const pagamentoComissaoUpdateBodyInputSchema =
  pagamentoComissaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PagamentoComissaoWithRelationships extends PagamentoComissao {
  comissao?: Comissao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

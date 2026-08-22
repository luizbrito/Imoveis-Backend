import { ParcelaVenda } from '../../prisma/generated/client';
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
import { parcelaVendaEnumerators } from './parcelaVendaEnumerators';
import { Venda } from '../../prisma/generated/client';

export const parcelaVendaFindSchema = z.object({
  id: z.string(),
});

export const parcelaVendaFilterInputSchema = z
  .object({
    numeroParcelaRange: z.array(numberOptionalSchema).max(2),
    dataVencimentoRange: z.array(dateOptionalSchema).max(2),
    valorRange: z.array(numberOptionalSchema).max(2),
    status: z.enum(parcelaVendaEnumerators.status).nullable().optional(),
    dataPagamentoRange: z.array(dateOptionalSchema).max(2),
    valorPagoRange: z.array(numberOptionalSchema).max(2),
    formaPagamento: z
      .enum(parcelaVendaEnumerators.formaPagamento)
      .nullable()
      .optional(),
    venda: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const parcelaVendaFindManyInputSchema = z.object({
  filter: parcelaVendaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const parcelaVendaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const parcelaVendaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const parcelaVendaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const parcelaVendaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ numeroParcela: 'asc' }),
});

export const parcelaVendaAutocompleteOutputSchema = z.object({
  id: z.string(),
  numeroParcela: z.string(),
});

export const parcelaVendaCreateInputSchema = z.object({
  numeroParcela: numberSchema.pipe(z.int().min(1).max(1000)),
  dataVencimento: dateSchema,
  valor: numberSchema.pipe(z.number().min(0)),
  status: z.enum(parcelaVendaEnumerators.status),
  dataPagamento: dateOptionalSchema,
  valorPago: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  formaPagamento: z
    .enum(parcelaVendaEnumerators.formaPagamento)
    .nullable()
    .optional(),
  comprovantes: z.array(fileUploadedSchema).max(5).optional(),
  venda: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const parcelaVendaImportInputSchema = parcelaVendaCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    comprovantes: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const parcelaVendaImportFileSchema = z
  .object({
    numeroParcela: z.string(),
    dataVencimento: z.string(),
    valor: z.string(),
    status: z.string(),
    dataPagamento: z.string(),
    valorPago: z.string(),
    formaPagamento: z.string(),
    comprovantes: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    venda: z.string(),
  })
  .partial();

export const parcelaVendaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const parcelaVendaUpdateBodyInputSchema = parcelaVendaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ParcelaVendaWithRelationships extends ParcelaVenda {
  venda?: Venda;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

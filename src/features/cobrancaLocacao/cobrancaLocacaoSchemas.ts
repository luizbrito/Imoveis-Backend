import { CobrancaLocacao } from '../../prisma/generated/client';
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
import { MemberWithRelationships } from '../member/memberSchemas';
import { cobrancaLocacaoEnumerators } from './cobrancaLocacaoEnumerators';
import { PagamentoLocacao } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';

export const cobrancaLocacaoFindSchema = z.object({
  id: z.string(),
});

export const cobrancaLocacaoFilterInputSchema = z
  .object({
    competencia: z.string(),
    dataVencimentoRange: z.array(dateOptionalSchema).max(2),
    status: z.enum(cobrancaLocacaoEnumerators.status).nullable().optional(),
    valorAluguelRange: z.array(numberOptionalSchema).max(2),
    valorCondominioRange: z.array(numberOptionalSchema).max(2),
    valorIptuRange: z.array(numberOptionalSchema).max(2),
    valorSeguroRange: z.array(numberOptionalSchema).max(2),
    valorMultaRange: z.array(numberOptionalSchema).max(2),
    valorJurosRange: z.array(numberOptionalSchema).max(2),
    valorDescontosRange: z.array(numberOptionalSchema).max(2),
    valorTotalRange: z.array(numberOptionalSchema).max(2),
    linhaDigitavel: z.string(),
    locacao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const cobrancaLocacaoFindManyInputSchema = z.object({
  filter: cobrancaLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const cobrancaLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cobrancaLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cobrancaLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cobrancaLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ competencia: 'asc' }),
});

export const cobrancaLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  competencia: z.string(),
});

export const cobrancaLocacaoCreateInputSchema = z.object({
  competencia: z.string().trim().min(1).min(1).max(7),
  dataVencimento: dateSchema,
  status: z.enum(cobrancaLocacaoEnumerators.status),
  valorAluguel: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorCondominio: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorIptu: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  valorSeguro: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorMulta: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorJuros: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorDescontos: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorTotal: numberSchema.pipe(z.number().min(0)),
  linhaDigitavel: z
    .string()
    .trim()
    .max(200)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  urlBoleto: z
    .string()
    .trim()
    .max(500)
    .url()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  locacao: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const cobrancaLocacaoImportInputSchema =
  cobrancaLocacaoCreateInputSchema.extend(importerInputSchema.shape);

export const cobrancaLocacaoImportFileSchema = z
  .object({
    competencia: z.string(),
    dataVencimento: z.string(),
    status: z.string(),
    valorAluguel: z.string(),
    valorCondominio: z.string(),
    valorIptu: z.string(),
    valorSeguro: z.string(),
    valorMulta: z.string(),
    valorJuros: z.string(),
    valorDescontos: z.string(),
    valorTotal: z.string(),
    linhaDigitavel: z.string(),
    urlBoleto: z.string(),
    observacoes: z.string(),
    pagamentos: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    locacao: z.string(),
  })
  .partial();

export const cobrancaLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const cobrancaLocacaoUpdateBodyInputSchema =
  cobrancaLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CobrancaLocacaoWithRelationships extends CobrancaLocacao {
  pagamentos?: PagamentoLocacao[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  locacao?: Locacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { ContaFinanceira } from '../../prisma/generated/client';
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
import { MemberWithRelationships } from '../member/memberSchemas';
import { contaFinanceiraEnumerators } from './contaFinanceiraEnumerators';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const contaFinanceiraFindSchema = z.object({
  id: z.string(),
});

export const contaFinanceiraFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(contaFinanceiraEnumerators.tipo).nullable().optional(),
    banco: z.string(),
    agencia: z.string(),
    numeroConta: z.string(),
    moeda: z.enum(contaFinanceiraEnumerators.moeda).nullable().optional(),
    saldoInicialRange: z.array(numberOptionalSchema).max(2),
    ativa: booleanStringOptionalSchema,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const contaFinanceiraFindManyInputSchema = z.object({
  filter: contaFinanceiraFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const contaFinanceiraDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contaFinanceiraArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contaFinanceiraRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contaFinanceiraAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const contaFinanceiraAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const contaFinanceiraCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(120),
  tipo: z.enum(contaFinanceiraEnumerators.tipo),
  banco: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  agencia: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  numeroConta: z
    .string()
    .trim()
    .max(50)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  moeda: z.enum(contaFinanceiraEnumerators.moeda),
  saldoInicial: numberOptionalSchema.pipe(z.number().nullable().optional()),
  ativa: z.boolean().default(false),
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const contaFinanceiraImportInputSchema =
  contaFinanceiraCreateInputSchema.extend(importerInputSchema.shape);

export const contaFinanceiraImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    banco: z.string(),
    agencia: z.string(),
    numeroConta: z.string(),
    moeda: z.string(),
    saldoInicial: z.string(),
    ativa: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    lancamentos: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
  })
  .partial();

export const contaFinanceiraUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const contaFinanceiraUpdateBodyInputSchema =
  contaFinanceiraCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ContaFinanceiraWithRelationships extends ContaFinanceira {
  lancamentos?: LancamentoFinanceiro[];
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

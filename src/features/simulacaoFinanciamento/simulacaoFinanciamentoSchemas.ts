import { SimulacaoFinanciamento } from '../../prisma/generated/client';
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
import { MemberWithRelationships } from '../member/memberSchemas';
import { simulacaoFinanciamentoEnumerators } from './simulacaoFinanciamentoEnumerators';
import { Cliente } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';

export const simulacaoFinanciamentoFindSchema = z.object({
  id: z.string(),
});

export const simulacaoFinanciamentoFilterInputSchema = z
  .object({
    dataSimulacaoRange: z.array(dateTimeOptionalSchema).max(2),
    valorImovelRange: z.array(numberOptionalSchema).max(2),
    valorEntradaRange: z.array(numberOptionalSchema).max(2),
    valorFinanciadoRange: z.array(numberOptionalSchema).max(2),
    prazoMesesRange: z.array(numberOptionalSchema).max(2),
    taxaJurosAnualRange: z.array(numberOptionalSchema).max(2),
    sistemaAmortizacao: z
      .enum(simulacaoFinanciamentoEnumerators.sistemaAmortizacao)
      .nullable()
      .optional(),
    valorParcelaInicialRange: z.array(numberOptionalSchema).max(2),
    instituicaoFinanceira: z.string(),
    status: z
      .enum(simulacaoFinanciamentoEnumerators.status)
      .nullable()
      .optional(),
    cliente: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    proposta: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const simulacaoFinanciamentoFindManyInputSchema = z.object({
  filter: simulacaoFinanciamentoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const simulacaoFinanciamentoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const simulacaoFinanciamentoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const simulacaoFinanciamentoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const simulacaoFinanciamentoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ dataSimulacao: 'asc' }),
});

export const simulacaoFinanciamentoAutocompleteOutputSchema = z.object({
  id: z.string(),
  dataSimulacao: z.string(),
});

export const simulacaoFinanciamentoCreateInputSchema = z.object({
  dataSimulacao: dateTimeSchema,
  valorImovel: numberSchema.pipe(z.number().min(0)),
  valorEntrada: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorFinanciado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  prazoMeses: numberOptionalSchema.pipe(
    z.int().min(1).max(600).nullable().optional(),
  ),
  taxaJurosAnual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  sistemaAmortizacao: z
    .enum(simulacaoFinanciamentoEnumerators.sistemaAmortizacao)
    .nullable()
    .optional(),
  valorParcelaInicial: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  instituicaoFinanceira: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  status: z
    .enum(simulacaoFinanciamentoEnumerators.status)
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cliente: objectToUuidSchema,
  imovel: objectToUuidSchema,
  proposta: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const simulacaoFinanciamentoImportInputSchema =
  simulacaoFinanciamentoCreateInputSchema.extend(importerInputSchema.shape);

export const simulacaoFinanciamentoImportFileSchema = z
  .object({
    dataSimulacao: z.string(),
    valorImovel: z.string(),
    valorEntrada: z.string(),
    valorFinanciado: z.string(),
    prazoMeses: z.string(),
    taxaJurosAnual: z.string(),
    sistemaAmortizacao: z.string(),
    valorParcelaInicial: z.string(),
    instituicaoFinanceira: z.string(),
    status: z.string(),
    observacoes: z.string(),
    cliente: z.string(),
    imovel: z.string(),
    proposta: z.string(),
  })
  .partial();

export const simulacaoFinanciamentoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const simulacaoFinanciamentoUpdateBodyInputSchema =
  simulacaoFinanciamentoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SimulacaoFinanciamentoWithRelationships extends SimulacaoFinanciamento {
  cliente?: Cliente;
  imovel?: Imovel;
  proposta?: Proposta;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

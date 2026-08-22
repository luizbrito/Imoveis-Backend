import { Venda } from '../../prisma/generated/client';
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
import { vendaEnumerators } from './vendaEnumerators';
import { ContratoVenda } from '../../prisma/generated/client';
import { ParcelaVenda } from '../../prisma/generated/client';
import { Comissao } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const vendaFindSchema = z.object({
  id: z.string(),
});

export const vendaFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataVendaRange: z.array(dateOptionalSchema).max(2),
    status: z.enum(vendaEnumerators.status).nullable().optional(),
    valorVendaRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(vendaEnumerators.moeda).nullable().optional(),
    valorSinalRange: z.array(numberOptionalSchema).max(2),
    valorFinanciadoRange: z.array(numberOptionalSchema).max(2),
    valorPermutaRange: z.array(numberOptionalSchema).max(2),
    dataPrevisaoEscrituraRange: z.array(dateOptionalSchema).max(2),
    dataEscrituraRange: z.array(dateOptionalSchema).max(2),
    cartorio: z.string(),
    filial: objectToUuidSchemaOptional,
    proposta: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    comprador: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const vendaFindManyInputSchema = z.object({
  filter: vendaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const vendaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vendaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vendaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vendaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const vendaAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const vendaCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataVenda: dateSchema,
  status: z.enum(vendaEnumerators.status),
  valorVenda: numberSchema.pipe(z.number().min(0)),
  moeda: z.enum(vendaEnumerators.moeda),
  valorSinal: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorFinanciado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorPermuta: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  dataPrevisaoEscritura: dateOptionalSchema,
  dataEscritura: dateOptionalSchema,
  cartorio: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(3500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  proposta: objectToUuidSchemaOptional,
  imovel: objectToUuidSchema,
  proprietario: objectToUuidSchema,
  comprador: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const vendaImportInputSchema = vendaCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const vendaImportFileSchema = z
  .object({
    codigo: z.string(),
    dataVenda: z.string(),
    status: z.string(),
    valorVenda: z.string(),
    moeda: z.string(),
    valorSinal: z.string(),
    valorFinanciado: z.string(),
    valorPermuta: z.string(),
    dataPrevisaoEscritura: z.string(),
    dataEscritura: z.string(),
    cartorio: z.string(),
    observacoes: z.string(),
    contratos: z.string().transform((val) => val.split(' ')),
    parcelas: z.string().transform((val) => val.split(' ')),
    comissoes: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
    proposta: z.string(),
    imovel: z.string(),
    proprietario: z.string(),
    comprador: z.string(),
    corretor: z.string(),
  })
  .partial();

export const vendaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const vendaUpdateBodyInputSchema = vendaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface VendaWithRelationships extends Venda {
  contratos?: ContratoVenda[];
  parcelas?: ParcelaVenda[];
  comissoes?: Comissao[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  filial?: Filial;
  proposta?: Proposta;
  imovel?: Imovel;
  proprietario?: Proprietario;
  comprador?: Cliente;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

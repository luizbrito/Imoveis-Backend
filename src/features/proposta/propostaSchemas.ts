import { Proposta } from '../../prisma/generated/client';
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
import { propostaEnumerators } from './propostaEnumerators';
import { CondicaoProposta } from '../../prisma/generated/client';
import { ReservaImovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { SimulacaoFinanciamento } from '../../prisma/generated/client';
import { Visita } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const propostaFindSchema = z.object({
  id: z.string(),
});

export const propostaFilterInputSchema = z
  .object({
    codigo: z.string(),
    tipo: z.enum(propostaEnumerators.tipo).nullable().optional(),
    dataPropostaRange: z.array(dateOptionalSchema).max(2),
    validadeAteRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(propostaEnumerators.status).nullable().optional(),
    valorPropostoRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(propostaEnumerators.moeda).nullable().optional(),
    sinalRange: z.array(numberOptionalSchema).max(2),
    formaPagamento: z
      .enum(propostaEnumerators.formaPagamento)
      .nullable()
      .optional(),
    percentualComissaoRange: z.array(numberOptionalSchema).max(2),
    motivoRecusa: z.string(),
    visitaOrigem: objectToUuidSchemaOptional,
    lead: objectToUuidSchemaOptional,
    cliente: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const propostaFindManyInputSchema = z.object({
  filter: propostaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const propostaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const propostaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const propostaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const propostaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const propostaAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const propostaCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  tipo: z.enum(propostaEnumerators.tipo),
  dataProposta: dateSchema,
  validadeAte: dateTimeOptionalSchema,
  status: z.enum(propostaEnumerators.status),
  valorProposto: numberSchema.pipe(z.number().min(0)),
  moeda: z.enum(propostaEnumerators.moeda),
  sinal: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  formaPagamento: z
    .enum(propostaEnumerators.formaPagamento)
    .nullable()
    .optional(),
  percentualComissao: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  termos: z
    .string()
    .trim()
    .max(6000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  documentos: z.array(fileUploadedSchema).max(10).optional(),
  motivoRecusa: z
    .string()
    .trim()
    .max(1000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  visitaOrigem: objectToUuidSchemaOptional,
  lead: objectToUuidSchemaOptional,
  cliente: objectToUuidSchema,
  imovel: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const propostaImportInputSchema = propostaCreateInputSchema
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

export const propostaImportFileSchema = z
  .object({
    codigo: z.string(),
    tipo: z.string(),
    dataProposta: z.string(),
    validadeAte: z.string(),
    status: z.string(),
    valorProposto: z.string(),
    moeda: z.string(),
    sinal: z.string(),
    formaPagamento: z.string(),
    percentualComissao: z.string(),
    termos: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    motivoRecusa: z.string(),
    condicoes: z.string().transform((val) => val.split(' ')),
    reservas: z.string().transform((val) => val.split(' ')),
    vendasGeradas: z.string().transform((val) => val.split(' ')),
    locacoesGeradas: z.string().transform((val) => val.split(' ')),
    simulacoesFinanciamento: z.string().transform((val) => val.split(' ')),
    visitaOrigem: z.string(),
    lead: z.string(),
    cliente: z.string(),
    imovel: z.string(),
    corretor: z.string(),
  })
  .partial();

export const propostaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const propostaUpdateBodyInputSchema = propostaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PropostaWithRelationships extends Proposta {
  condicoes?: CondicaoProposta[];
  reservas?: ReservaImovel[];
  vendasGeradas?: Venda[];
  locacoesGeradas?: Locacao[];
  simulacoesFinanciamento?: SimulacaoFinanciamento[];
  visitaOrigem?: Visita;
  lead?: Lead;
  cliente?: Cliente;
  imovel?: Imovel;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { SolicitacaoContato } from '../../prisma/generated/client';
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
import { solicitacaoContatoEnumerators } from './solicitacaoContatoEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { Anuncio } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const solicitacaoContatoFindSchema = z.object({
  id: z.string(),
});

export const solicitacaoContatoFilterInputSchema = z
  .object({
    nome: z.string(),
    telefone: z.string(),
    email: z.string(),
    canalOrigem: z
      .enum(solicitacaoContatoEnumerators.canalOrigem)
      .nullable()
      .optional(),
    dataHoraRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(solicitacaoContatoEnumerators.status).nullable().optional(),
    consentiuContato: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    anuncio: objectToUuidSchemaOptional,
    corretorResponsavel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const solicitacaoContatoFindManyInputSchema = z.object({
  filter: solicitacaoContatoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const solicitacaoContatoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoContatoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoContatoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoContatoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const solicitacaoContatoAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const solicitacaoContatoCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
  telefone: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .max(150)
    .email()
    .toLowerCase()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  canalOrigem: z.enum(solicitacaoContatoEnumerators.canalOrigem),
  dataHora: dateTimeSchema,
  status: z.enum(solicitacaoContatoEnumerators.status),
  mensagem: z.string().trim().min(1).max(3000),
  consentiuContato: z.boolean().default(false),
  imovel: objectToUuidSchemaOptional,
  anuncio: objectToUuidSchemaOptional,
  corretorResponsavel: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const solicitacaoContatoImportInputSchema =
  solicitacaoContatoCreateInputSchema.extend(importerInputSchema.shape);

export const solicitacaoContatoImportFileSchema = z
  .object({
    nome: z.string(),
    telefone: z.string(),
    email: z.string(),
    canalOrigem: z.string(),
    dataHora: z.string(),
    status: z.string(),
    mensagem: z.string(),
    consentiuContato: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    imovel: z.string(),
    anuncio: z.string(),
    corretorResponsavel: z.string(),
  })
  .partial();

export const solicitacaoContatoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const solicitacaoContatoUpdateBodyInputSchema =
  solicitacaoContatoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SolicitacaoContatoWithRelationships extends SolicitacaoContato {
  imovel?: Imovel;
  anuncio?: Anuncio;
  corretorResponsavel?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

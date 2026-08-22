import { ParticipanteLocacao } from '../../prisma/generated/client';
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
import { participanteLocacaoEnumerators } from './participanteLocacaoEnumerators';
import { Locacao } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';

export const participanteLocacaoFindSchema = z.object({
  id: z.string(),
});

export const participanteLocacaoFilterInputSchema = z
  .object({
    papel: z.enum(participanteLocacaoEnumerators.papel).nullable().optional(),
    percentualResponsabilidadeRange: z.array(numberOptionalSchema).max(2),
    aprovadoCadastro: booleanStringOptionalSchema,
    dataAprovacaoRange: z.array(dateOptionalSchema).max(2),
    locacao: objectToUuidSchemaOptional,
    cliente: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const participanteLocacaoFindManyInputSchema = z.object({
  filter: participanteLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const participanteLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const participanteLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const participanteLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const participanteLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ papel: 'asc' }),
});

export const participanteLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  papel: z.string(),
});

export const participanteLocacaoCreateInputSchema = z.object({
  papel: z.enum(participanteLocacaoEnumerators.papel),
  percentualResponsabilidade: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  aprovadoCadastro: z.boolean().default(false),
  dataAprovacao: dateOptionalSchema,
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  locacao: objectToUuidSchema,
  cliente: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const participanteLocacaoImportInputSchema =
  participanteLocacaoCreateInputSchema.extend(importerInputSchema.shape);

export const participanteLocacaoImportFileSchema = z
  .object({
    papel: z.string(),
    percentualResponsabilidade: z.string(),
    aprovadoCadastro: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    dataAprovacao: z.string(),
    observacoes: z.string(),
    locacao: z.string(),
    cliente: z.string(),
  })
  .partial();

export const participanteLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const participanteLocacaoUpdateBodyInputSchema =
  participanteLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ParticipanteLocacaoWithRelationships extends ParticipanteLocacao {
  locacao?: Locacao;
  cliente?: Cliente;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

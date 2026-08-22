import { CondicaoProposta } from '../../prisma/generated/client';
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
import { condicaoPropostaEnumerators } from './condicaoPropostaEnumerators';
import { Proposta } from '../../prisma/generated/client';

export const condicaoPropostaFindSchema = z.object({
  id: z.string(),
});

export const condicaoPropostaFilterInputSchema = z
  .object({
    ordemRange: z.array(numberOptionalSchema).max(2),
    tipo: z.enum(condicaoPropostaEnumerators.tipo).nullable().optional(),
    obrigatoria: booleanStringOptionalSchema,
    atendida: booleanStringOptionalSchema,
    proposta: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const condicaoPropostaFindManyInputSchema = z.object({
  filter: condicaoPropostaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const condicaoPropostaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoPropostaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoPropostaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condicaoPropostaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ descricao: 'asc' }),
});

export const condicaoPropostaAutocompleteOutputSchema = z.object({
  id: z.string(),
  descricao: z.string(),
});

export const condicaoPropostaCreateInputSchema = z.object({
  ordem: numberOptionalSchema.pipe(
    z.int().min(0).max(1000).nullable().optional(),
  ),
  tipo: z.enum(condicaoPropostaEnumerators.tipo),
  descricao: z.string().trim().min(1).min(1).max(2500),
  obrigatoria: z.boolean().default(false),
  atendida: z.boolean().default(false),
  proposta: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const condicaoPropostaImportInputSchema =
  condicaoPropostaCreateInputSchema.extend(importerInputSchema.shape);

export const condicaoPropostaImportFileSchema = z
  .object({
    ordem: z.string(),
    tipo: z.string(),
    descricao: z.string(),
    obrigatoria: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    atendida: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    proposta: z.string(),
  })
  .partial();

export const condicaoPropostaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const condicaoPropostaUpdateBodyInputSchema =
  condicaoPropostaCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CondicaoPropostaWithRelationships extends CondicaoProposta {
  proposta?: Proposta;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

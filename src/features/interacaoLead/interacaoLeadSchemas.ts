import { InteracaoLead } from '../../prisma/generated/client';
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
import { interacaoLeadEnumerators } from './interacaoLeadEnumerators';
import { Lead } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const interacaoLeadFindSchema = z.object({
  id: z.string(),
});

export const interacaoLeadFilterInputSchema = z
  .object({
    dataHoraRange: z.array(dateTimeOptionalSchema).max(2),
    tipo: z.enum(interacaoLeadEnumerators.tipo).nullable().optional(),
    resultado: z.enum(interacaoLeadEnumerators.resultado).nullable().optional(),
    assunto: z.string(),
    proximaAcao: z.string(),
    dataProximaAcaoRange: z.array(dateTimeOptionalSchema).max(2),
    lead: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const interacaoLeadFindManyInputSchema = z.object({
  filter: interacaoLeadFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const interacaoLeadDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const interacaoLeadArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const interacaoLeadRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const interacaoLeadAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ assunto: 'asc' }),
});

export const interacaoLeadAutocompleteOutputSchema = z.object({
  id: z.string(),
  assunto: z.string(),
});

export const interacaoLeadCreateInputSchema = z.object({
  dataHora: dateTimeSchema,
  tipo: z.enum(interacaoLeadEnumerators.tipo),
  resultado: z.enum(interacaoLeadEnumerators.resultado).nullable().optional(),
  assunto: z.string().trim().min(1).min(1).max(180),
  descricao: z
    .string()
    .trim()
    .max(4000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  proximaAcao: z
    .string()
    .trim()
    .max(500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataProximaAcao: dateTimeOptionalSchema,
  lead: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const interacaoLeadImportInputSchema =
  interacaoLeadCreateInputSchema.extend(importerInputSchema.shape);

export const interacaoLeadImportFileSchema = z
  .object({
    dataHora: z.string(),
    tipo: z.string(),
    resultado: z.string(),
    assunto: z.string(),
    descricao: z.string(),
    proximaAcao: z.string(),
    dataProximaAcao: z.string(),
    lead: z.string(),
    corretor: z.string(),
  })
  .partial();

export const interacaoLeadUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const interacaoLeadUpdateBodyInputSchema = interacaoLeadCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface InteracaoLeadWithRelationships extends InteracaoLead {
  lead?: Lead;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

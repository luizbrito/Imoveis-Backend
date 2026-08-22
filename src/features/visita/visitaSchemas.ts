import { Visita } from '../../prisma/generated/client';
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
import { visitaEnumerators } from './visitaEnumerators';
import { Proposta } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const visitaFindSchema = z.object({
  id: z.string(),
});

export const visitaFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataInicioRange: z.array(dateTimeOptionalSchema).max(2),
    dataFimRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(visitaEnumerators.status).nullable().optional(),
    tipo: z.enum(visitaEnumerators.tipo).nullable().optional(),
    pontoEncontro: z.string(),
    interessePosVisita: z
      .enum(visitaEnumerators.interessePosVisita)
      .nullable()
      .optional(),
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

export const visitaFindManyInputSchema = z.object({
  filter: visitaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const visitaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const visitaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const visitaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const visitaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const visitaAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const visitaCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataInicio: dateTimeSchema,
  dataFim: dateTimeOptionalSchema,
  status: z.enum(visitaEnumerators.status),
  tipo: z.enum(visitaEnumerators.tipo),
  pontoEncontro: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  feedbackCliente: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  interessePosVisita: z
    .enum(visitaEnumerators.interessePosVisita)
    .nullable()
    .optional(),
  observacoesInternas: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  lead: objectToUuidSchemaOptional,
  cliente: objectToUuidSchema,
  imovel: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const visitaImportInputSchema = visitaCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const visitaImportFileSchema = z
  .object({
    codigo: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    status: z.string(),
    tipo: z.string(),
    pontoEncontro: z.string(),
    feedbackCliente: z.string(),
    interessePosVisita: z.string(),
    observacoesInternas: z.string(),
    propostas: z.string().transform((val) => val.split(' ')),
    lead: z.string(),
    cliente: z.string(),
    imovel: z.string(),
    corretor: z.string(),
  })
  .partial();

export const visitaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const visitaUpdateBodyInputSchema = visitaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface VisitaWithRelationships extends Visita {
  propostas?: Proposta[];
  lead?: Lead;
  cliente?: Cliente;
  imovel?: Imovel;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

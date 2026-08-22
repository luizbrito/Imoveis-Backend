import { TarefaComercial } from '../../prisma/generated/client';
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
import { tarefaComercialEnumerators } from './tarefaComercialEnumerators';
import { Lead } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';

export const tarefaComercialFindSchema = z.object({
  id: z.string(),
});

export const tarefaComercialFilterInputSchema = z
  .object({
    titulo: z.string(),
    tipo: z.enum(tarefaComercialEnumerators.tipo).nullable().optional(),
    prioridade: z
      .enum(tarefaComercialEnumerators.prioridade)
      .nullable()
      .optional(),
    status: z.enum(tarefaComercialEnumerators.status).nullable().optional(),
    dataLimiteRange: z.array(dateTimeOptionalSchema).max(2),
    dataConclusaoRange: z.array(dateTimeOptionalSchema).max(2),
    lead: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    cliente: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const tarefaComercialFindManyInputSchema = z.object({
  filter: tarefaComercialFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const tarefaComercialDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tarefaComercialArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tarefaComercialRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tarefaComercialAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const tarefaComercialAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const tarefaComercialCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(tarefaComercialEnumerators.tipo),
  prioridade: z.enum(tarefaComercialEnumerators.prioridade),
  status: z.enum(tarefaComercialEnumerators.status),
  dataLimite: dateTimeOptionalSchema,
  dataConclusao: dateTimeOptionalSchema,
  descricao: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  lead: objectToUuidSchemaOptional,
  corretor: objectToUuidSchema,
  cliente: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const tarefaComercialImportInputSchema =
  tarefaComercialCreateInputSchema.extend(importerInputSchema.shape);

export const tarefaComercialImportFileSchema = z
  .object({
    titulo: z.string(),
    tipo: z.string(),
    prioridade: z.string(),
    status: z.string(),
    dataLimite: z.string(),
    dataConclusao: z.string(),
    descricao: z.string(),
    lead: z.string(),
    corretor: z.string(),
    cliente: z.string(),
  })
  .partial();

export const tarefaComercialUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const tarefaComercialUpdateBodyInputSchema =
  tarefaComercialCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface TarefaComercialWithRelationships extends TarefaComercial {
  lead?: Lead;
  corretor?: Corretor;
  cliente?: Cliente;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

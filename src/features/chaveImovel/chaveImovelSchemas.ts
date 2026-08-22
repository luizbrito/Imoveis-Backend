import { ChaveImovel } from '../../prisma/generated/client';
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
import { chaveImovelEnumerators } from './chaveImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const chaveImovelFindSchema = z.object({
  id: z.string(),
});

export const chaveImovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    tipo: z.enum(chaveImovelEnumerators.tipo).nullable().optional(),
    status: z.enum(chaveImovelEnumerators.status).nullable().optional(),
    localArmazenamento: z.string(),
    dataRetiradaRange: z.array(dateTimeOptionalSchema).max(2),
    dataPrevistaDevolucaoRange: z.array(dateTimeOptionalSchema).max(2),
    dataDevolucaoRange: z.array(dateTimeOptionalSchema).max(2),
    retiradaPor: z.string(),
    telefoneRetirada: z.string(),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const chaveImovelFindManyInputSchema = z.object({
  filter: chaveImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const chaveImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaveImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaveImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaveImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const chaveImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const chaveImovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  tipo: z.enum(chaveImovelEnumerators.tipo),
  status: z.enum(chaveImovelEnumerators.status),
  localArmazenamento: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataRetirada: dateTimeOptionalSchema,
  dataPrevistaDevolucao: dateTimeOptionalSchema,
  dataDevolucao: dateTimeOptionalSchema,
  retiradaPor: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  telefoneRetirada: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const chaveImovelImportInputSchema = chaveImovelCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const chaveImovelImportFileSchema = z
  .object({
    codigo: z.string(),
    tipo: z.string(),
    status: z.string(),
    localArmazenamento: z.string(),
    dataRetirada: z.string(),
    dataPrevistaDevolucao: z.string(),
    dataDevolucao: z.string(),
    retiradaPor: z.string(),
    telefoneRetirada: z.string(),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const chaveImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const chaveImovelUpdateBodyInputSchema = chaveImovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ChaveImovelWithRelationships extends ChaveImovel {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

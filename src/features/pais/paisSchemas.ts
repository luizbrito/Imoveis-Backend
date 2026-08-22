import { Pais } from '../../prisma/generated/client';
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
import { Estado } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';

export const paisFindSchema = z.object({
  id: z.string(),
});

export const paisFilterInputSchema = z
  .object({
    nome: z.string(),
    sigla: z.string(),
    codigoTelefone: z.string(),
    nacionalidade: z.string(),
    ativo: booleanStringOptionalSchema,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const paisFindManyInputSchema = z.object({
  filter: paisFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const paisDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const paisArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const paisRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const paisAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const paisAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const paisCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(120),
  sigla: z.string().trim().min(1).max(3),
  codigoTelefone: z.string().trim().min(1).max(8),
  nacionalidade: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  importHash: z.string().optional(),
});

export const paisImportInputSchema = paisCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const paisImportFileSchema = z
  .object({
    nome: z.string(),
    sigla: z.string(),
    codigoTelefone: z.string(),
    nacionalidade: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    estados: z.string().transform((val) => val.split(' ')),
    imoveisPais: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const paisUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const paisUpdateBodyInputSchema = paisCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PaisWithRelationships extends Pais {
  estados?: Estado[];
  imoveisPais?: Imovel[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

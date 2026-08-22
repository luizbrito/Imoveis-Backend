import { FavoritoCliente } from '../../prisma/generated/client';
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
import { Cliente } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';

export const favoritoClienteFindSchema = z.object({
  id: z.string(),
});

export const favoritoClienteFilterInputSchema = z
  .object({
    dataInclusaoRange: z.array(dateTimeOptionalSchema).max(2),
    ativo: booleanStringOptionalSchema,
    cliente: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const favoritoClienteFindManyInputSchema = z.object({
  filter: favoritoClienteFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const favoritoClienteDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const favoritoClienteArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const favoritoClienteRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const favoritoClienteAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ dataInclusao: 'asc' }),
});

export const favoritoClienteAutocompleteOutputSchema = z.object({
  id: z.string(),
  dataInclusao: z.string(),
});

export const favoritoClienteCreateInputSchema = z.object({
  dataInclusao: dateTimeSchema,
  observacoes: z
    .string()
    .trim()
    .max(1000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativo: z.boolean().default(false),
  cliente: objectToUuidSchema,
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const favoritoClienteImportInputSchema =
  favoritoClienteCreateInputSchema.extend(importerInputSchema.shape);

export const favoritoClienteImportFileSchema = z
  .object({
    dataInclusao: z.string(),
    observacoes: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    cliente: z.string(),
    imovel: z.string(),
  })
  .partial();

export const favoritoClienteUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const favoritoClienteUpdateBodyInputSchema =
  favoritoClienteCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface FavoritoClienteWithRelationships extends FavoritoCliente {
  cliente?: Cliente;
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { Cidade } from '../../prisma/generated/client';
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
import { Imovel } from '../../prisma/generated/client';
import { Estado } from '../../prisma/generated/client';

export const cidadeFindSchema = z.object({
  id: z.string(),
});

export const cidadeFilterInputSchema = z
  .object({
    nome: z.string(),
    codigoOficial: z.string(),
    codigoPostal: z.string(),
    latitudeRange: z.array(numberOptionalSchema).max(2),
    longitudeRange: z.array(numberOptionalSchema).max(2),
    ativo: booleanStringOptionalSchema,
    estado: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const cidadeFindManyInputSchema = z.object({
  filter: cidadeFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const cidadeDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cidadeArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cidadeRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const cidadeAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const cidadeAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const cidadeCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(150),
  codigoOficial: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  codigoPostal: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  latitude: numberOptionalSchema.pipe(z.number().nullable().optional()),
  longitude: numberOptionalSchema.pipe(z.number().nullable().optional()),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  estado: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const cidadeImportInputSchema = cidadeCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const cidadeImportFileSchema = z
  .object({
    nome: z.string(),
    codigoOficial: z.string(),
    codigoPostal: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    imoveisCidade: z.string().transform((val) => val.split(' ')),
    estado: z.string(),
  })
  .partial();

export const cidadeUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const cidadeUpdateBodyInputSchema = cidadeCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CidadeWithRelationships extends Cidade {
  imoveisCidade?: Imovel[];
  estado?: Estado;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

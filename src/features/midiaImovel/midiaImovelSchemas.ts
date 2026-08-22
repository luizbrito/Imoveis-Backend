import { MidiaImovel } from '../../prisma/generated/client';
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
import { fileUploadedSchema } from '../file/fileSchemas';
import { MemberWithRelationships } from '../member/memberSchemas';
import { midiaImovelEnumerators } from './midiaImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const midiaImovelFindSchema = z.object({
  id: z.string(),
});

export const midiaImovelFilterInputSchema = z
  .object({
    titulo: z.string(),
    tipo: z.enum(midiaImovelEnumerators.tipo).nullable().optional(),
    ordemRange: z.array(numberOptionalSchema).max(2),
    principal: booleanStringOptionalSchema,
    publica: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const midiaImovelFindManyInputSchema = z.object({
  filter: midiaImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const midiaImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const midiaImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const midiaImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const midiaImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const midiaImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const midiaImovelCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(150),
  tipo: z.enum(midiaImovelEnumerators.tipo),
  imagens: z.array(fileUploadedSchema).max(20).optional(),
  urlExterna: z
    .string()
    .trim()
    .max(500)
    .url()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ordem: numberOptionalSchema.pipe(
    z.int().min(0).max(1000).nullable().optional(),
  ),
  principal: z.boolean().default(false),
  publica: z.boolean().default(false),
  legenda: z
    .string()
    .trim()
    .max(1000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const midiaImovelImportInputSchema = midiaImovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    imagens: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const midiaImovelImportFileSchema = z
  .object({
    titulo: z.string(),
    tipo: z.string(),
    imagens: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    urlExterna: z.string(),
    ordem: z.string(),
    principal: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    publica: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    legenda: z.string(),
    imovel: z.string(),
  })
  .partial();

export const midiaImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const midiaImovelUpdateBodyInputSchema = midiaImovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface MidiaImovelWithRelationships extends MidiaImovel {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

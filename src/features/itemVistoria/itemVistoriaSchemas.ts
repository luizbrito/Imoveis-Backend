import { ItemVistoria } from '../../prisma/generated/client';
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
import { itemVistoriaEnumerators } from './itemVistoriaEnumerators';
import { Vistoria } from '../../prisma/generated/client';

export const itemVistoriaFindSchema = z.object({
  id: z.string(),
});

export const itemVistoriaFilterInputSchema = z
  .object({
    ambiente: z.string(),
    item: z.string(),
    estado: z.enum(itemVistoriaEnumerators.estado).nullable().optional(),
    quantidadeRange: z.array(numberOptionalSchema).max(2),
    requerCorrecao: booleanStringOptionalSchema,
    valorEstimadoCorrecaoRange: z.array(numberOptionalSchema).max(2),
    vistoria: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const itemVistoriaFindManyInputSchema = z.object({
  filter: itemVistoriaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const itemVistoriaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemVistoriaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemVistoriaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemVistoriaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ item: 'asc' }),
});

export const itemVistoriaAutocompleteOutputSchema = z.object({
  id: z.string(),
  item: z.string(),
});

export const itemVistoriaCreateInputSchema = z.object({
  ambiente: z.string().trim().min(1).max(120),
  item: z.string().trim().min(1).min(1).max(150),
  estado: z.enum(itemVistoriaEnumerators.estado),
  quantidade: numberOptionalSchema.pipe(
    z.int().min(0).max(10000).nullable().optional(),
  ),
  descricao: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  fotos: z.array(fileUploadedSchema).max(20).optional(),
  requerCorrecao: z.boolean().default(false),
  valorEstimadoCorrecao: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  vistoria: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const itemVistoriaImportInputSchema = itemVistoriaCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    fotos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const itemVistoriaImportFileSchema = z
  .object({
    ambiente: z.string(),
    item: z.string(),
    estado: z.string(),
    quantidade: z.string(),
    descricao: z.string(),
    fotos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    requerCorrecao: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    valorEstimadoCorrecao: z.string(),
    vistoria: z.string(),
  })
  .partial();

export const itemVistoriaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const itemVistoriaUpdateBodyInputSchema = itemVistoriaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ItemVistoriaWithRelationships extends ItemVistoria {
  vistoria?: Vistoria;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

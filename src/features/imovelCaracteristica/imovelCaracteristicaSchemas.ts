import { ImovelCaracteristica } from '../../prisma/generated/client';
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
import { CaracteristicaImovel } from '../../prisma/generated/client';

export const imovelCaracteristicaFindSchema = z.object({
  id: z.string(),
});

export const imovelCaracteristicaFilterInputSchema = z
  .object({
    valorTexto: z.string(),
    destaque: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    caracteristica: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const imovelCaracteristicaFindManyInputSchema = z.object({
  filter: imovelCaracteristicaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const imovelCaracteristicaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelCaracteristicaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelCaracteristicaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const imovelCaracteristicaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ valorTexto: 'asc' }),
});

export const imovelCaracteristicaAutocompleteOutputSchema = z.object({
  id: z.string(),
  valorTexto: z.string(),
});

export const imovelCaracteristicaCreateInputSchema = z.object({
  valorTexto: z.string().trim().min(1).min(1).max(200),
  destaque: z.boolean().default(false),
  imovel: objectToUuidSchema,
  caracteristica: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const imovelCaracteristicaImportInputSchema =
  imovelCaracteristicaCreateInputSchema.extend(importerInputSchema.shape);

export const imovelCaracteristicaImportFileSchema = z
  .object({
    valorTexto: z.string(),
    destaque: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    imovel: z.string(),
    caracteristica: z.string(),
  })
  .partial();

export const imovelCaracteristicaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const imovelCaracteristicaUpdateBodyInputSchema =
  imovelCaracteristicaCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ImovelCaracteristicaWithRelationships extends ImovelCaracteristica {
  imovel?: Imovel;
  caracteristica?: CaracteristicaImovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

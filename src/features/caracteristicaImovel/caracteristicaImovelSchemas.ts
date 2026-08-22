import { CaracteristicaImovel } from '../../prisma/generated/client';
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
import { caracteristicaImovelEnumerators } from './caracteristicaImovelEnumerators';
import { ImovelCaracteristica } from '../../prisma/generated/client';

export const caracteristicaImovelFindSchema = z.object({
  id: z.string(),
});

export const caracteristicaImovelFilterInputSchema = z
  .object({
    nome: z.string(),
    grupo: z.enum(caracteristicaImovelEnumerators.grupo).nullable().optional(),
    icone: z.string(),
    ativa: booleanStringOptionalSchema,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const caracteristicaImovelFindManyInputSchema = z.object({
  filter: caracteristicaImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const caracteristicaImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const caracteristicaImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const caracteristicaImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const caracteristicaImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const caracteristicaImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const caracteristicaImovelCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(100),
  grupo: z.enum(caracteristicaImovelEnumerators.grupo),
  icone: z
    .string()
    .trim()
    .max(80)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativa: z.boolean().default(false),
  importHash: z.string().optional(),
});

export const caracteristicaImovelImportInputSchema =
  caracteristicaImovelCreateInputSchema.extend(importerInputSchema.shape);

export const caracteristicaImovelImportFileSchema = z
  .object({
    nome: z.string(),
    grupo: z.string(),
    icone: z.string(),
    ativa: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    imoveisVinculados: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const caracteristicaImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const caracteristicaImovelUpdateBodyInputSchema =
  caracteristicaImovelCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CaracteristicaImovelWithRelationships extends CaracteristicaImovel {
  imoveisVinculados?: ImovelCaracteristica[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { CampanhaAnuncio } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import {
  dateOptionalSchema,
  dateSchema,
} from '../../shared/schemas/dateSchema';
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
import { CampanhaMarketing } from '../../prisma/generated/client';
import { Anuncio } from '../../prisma/generated/client';

export const campanhaAnuncioFindSchema = z.object({
  id: z.string(),
});

export const campanhaAnuncioFilterInputSchema = z
  .object({
    dataInclusaoRange: z.array(dateOptionalSchema).max(2),
    investimentoAlocadoRange: z.array(numberOptionalSchema).max(2),
    impressoesRange: z.array(numberOptionalSchema).max(2),
    cliquesRange: z.array(numberOptionalSchema).max(2),
    leadsGeradosRange: z.array(numberOptionalSchema).max(2),
    campanha: objectToUuidSchemaOptional,
    anuncio: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const campanhaAnuncioFindManyInputSchema = z.object({
  filter: campanhaAnuncioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const campanhaAnuncioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaAnuncioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaAnuncioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaAnuncioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ dataInclusao: 'asc' }),
});

export const campanhaAnuncioAutocompleteOutputSchema = z.object({
  id: z.string(),
  dataInclusao: z.string(),
});

export const campanhaAnuncioCreateInputSchema = z.object({
  dataInclusao: dateSchema,
  investimentoAlocado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  impressoes: numberOptionalSchema.pipe(z.int().min(0).nullable().optional()),
  cliques: numberOptionalSchema.pipe(z.int().min(0).nullable().optional()),
  leadsGerados: numberOptionalSchema.pipe(z.int().min(0).nullable().optional()),
  campanha: objectToUuidSchema,
  anuncio: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const campanhaAnuncioImportInputSchema =
  campanhaAnuncioCreateInputSchema.extend(importerInputSchema.shape);

export const campanhaAnuncioImportFileSchema = z
  .object({
    dataInclusao: z.string(),
    investimentoAlocado: z.string(),
    impressoes: z.string(),
    cliques: z.string(),
    leadsGerados: z.string(),
    campanha: z.string(),
    anuncio: z.string(),
  })
  .partial();

export const campanhaAnuncioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const campanhaAnuncioUpdateBodyInputSchema =
  campanhaAnuncioCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CampanhaAnuncioWithRelationships extends CampanhaAnuncio {
  campanha?: CampanhaMarketing;
  anuncio?: Anuncio;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { PublicacaoPortal } from '../../prisma/generated/client';
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
import { publicacaoPortalEnumerators } from './publicacaoPortalEnumerators';
import { Anuncio } from '../../prisma/generated/client';
import { PortalImobiliario } from '../../prisma/generated/client';

export const publicacaoPortalFindSchema = z.object({
  id: z.string(),
});

export const publicacaoPortalFilterInputSchema = z
  .object({
    codigoExterno: z.string(),
    status: z.enum(publicacaoPortalEnumerators.status).nullable().optional(),
    dataEnvioRange: z.array(dateTimeOptionalSchema).max(2),
    dataAtualizacaoRange: z.array(dateTimeOptionalSchema).max(2),
    tentativasRange: z.array(numberOptionalSchema).max(2),
    anuncio: objectToUuidSchemaOptional,
    portal: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const publicacaoPortalFindManyInputSchema = z.object({
  filter: publicacaoPortalFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const publicacaoPortalDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const publicacaoPortalArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const publicacaoPortalRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const publicacaoPortalAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigoExterno: 'asc' }),
});

export const publicacaoPortalAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigoExterno: z.string(),
});

export const publicacaoPortalCreateInputSchema = z.object({
  codigoExterno: z.string().trim().min(1).min(1).max(150),
  status: z.enum(publicacaoPortalEnumerators.status),
  dataEnvio: dateTimeOptionalSchema,
  dataAtualizacao: dateTimeOptionalSchema,
  urlPublicada: z
    .string()
    .trim()
    .max(500)
    .url()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  mensagemRetorno: z
    .string()
    .trim()
    .max(3000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  tentativas: numberOptionalSchema.pipe(
    z.int().min(0).max(1000).nullable().optional(),
  ),
  anuncio: objectToUuidSchema,
  portal: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const publicacaoPortalImportInputSchema =
  publicacaoPortalCreateInputSchema.extend(importerInputSchema.shape);

export const publicacaoPortalImportFileSchema = z
  .object({
    codigoExterno: z.string(),
    status: z.string(),
    dataEnvio: z.string(),
    dataAtualizacao: z.string(),
    urlPublicada: z.string(),
    mensagemRetorno: z.string(),
    tentativas: z.string(),
    anuncio: z.string(),
    portal: z.string(),
  })
  .partial();

export const publicacaoPortalUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const publicacaoPortalUpdateBodyInputSchema =
  publicacaoPortalCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PublicacaoPortalWithRelationships extends PublicacaoPortal {
  anuncio?: Anuncio;
  portal?: PortalImobiliario;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

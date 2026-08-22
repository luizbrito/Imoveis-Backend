import { PortalImobiliario } from '../../prisma/generated/client';
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
import { portalImobiliarioEnumerators } from './portalImobiliarioEnumerators';
import { PublicacaoPortal } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';

export const portalImobiliarioFindSchema = z.object({
  id: z.string(),
});

export const portalImobiliarioFilterInputSchema = z
  .object({
    nome: z.string(),
    urlBase: z.string(),
    tipoIntegracao: z
      .enum(portalImobiliarioEnumerators.tipoIntegracao)
      .nullable()
      .optional(),
    identificadorConta: z.string(),
    ativo: booleanStringOptionalSchema,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const portalImobiliarioFindManyInputSchema = z.object({
  filter: portalImobiliarioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const portalImobiliarioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const portalImobiliarioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const portalImobiliarioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const portalImobiliarioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const portalImobiliarioAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const portalImobiliarioCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(120),
  urlBase: z
    .string()
    .trim()
    .max(300)
    .url()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  tipoIntegracao: z.enum(portalImobiliarioEnumerators.tipoIntegracao),
  identificadorConta: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  importHash: z.string().optional(),
});

export const portalImobiliarioImportInputSchema =
  portalImobiliarioCreateInputSchema.extend(importerInputSchema.shape);

export const portalImobiliarioImportFileSchema = z
  .object({
    nome: z.string(),
    urlBase: z.string(),
    tipoIntegracao: z.string(),
    identificadorConta: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    publicacoes: z.string().transform((val) => val.split(' ')),
    leadsGerados: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const portalImobiliarioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const portalImobiliarioUpdateBodyInputSchema =
  portalImobiliarioCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface PortalImobiliarioWithRelationships extends PortalImobiliario {
  publicacoes?: PublicacaoPortal[];
  leadsGerados?: Lead[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

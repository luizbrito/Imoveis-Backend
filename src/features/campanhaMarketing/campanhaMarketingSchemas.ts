import { CampanhaMarketing } from '../../prisma/generated/client';
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
import { campanhaMarketingEnumerators } from './campanhaMarketingEnumerators';
import { CampanhaAnuncio } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const campanhaMarketingFindSchema = z.object({
  id: z.string(),
});

export const campanhaMarketingFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(campanhaMarketingEnumerators.tipo).nullable().optional(),
    status: z.enum(campanhaMarketingEnumerators.status).nullable().optional(),
    dataInicioRange: z.array(dateOptionalSchema).max(2),
    dataFimRange: z.array(dateOptionalSchema).max(2),
    orcamentoRange: z.array(numberOptionalSchema).max(2),
    custoRealRange: z.array(numberOptionalSchema).max(2),
    quantidadeLeadsRange: z.array(numberOptionalSchema).max(2),
    quantidadeConversoesRange: z.array(numberOptionalSchema).max(2),
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const campanhaMarketingFindManyInputSchema = z.object({
  filter: campanhaMarketingFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const campanhaMarketingDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaMarketingArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaMarketingRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const campanhaMarketingAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const campanhaMarketingAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const campanhaMarketingCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(campanhaMarketingEnumerators.tipo),
  status: z.enum(campanhaMarketingEnumerators.status),
  dataInicio: dateOptionalSchema,
  dataFim: dateOptionalSchema,
  orcamento: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  custoReal: numberOptionalSchema.pipe(z.number().min(0).nullable().optional()),
  quantidadeLeads: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  quantidadeConversoes: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  observacoes: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const campanhaMarketingImportInputSchema =
  campanhaMarketingCreateInputSchema.extend(importerInputSchema.shape);

export const campanhaMarketingImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    status: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    orcamento: z.string(),
    custoReal: z.string(),
    quantidadeLeads: z.string(),
    quantidadeConversoes: z.string(),
    observacoes: z.string(),
    anunciosVinculados: z.string().transform((val) => val.split(' ')),
    leadsGerados: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
  })
  .partial();

export const campanhaMarketingUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const campanhaMarketingUpdateBodyInputSchema =
  campanhaMarketingCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CampanhaMarketingWithRelationships extends CampanhaMarketing {
  anunciosVinculados?: CampanhaAnuncio[];
  leadsGerados?: Lead[];
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

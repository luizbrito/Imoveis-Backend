import { SeguroImovel } from '../../prisma/generated/client';
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
import { seguroImovelEnumerators } from './seguroImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';

export const seguroImovelFindSchema = z.object({
  id: z.string(),
});

export const seguroImovelFilterInputSchema = z
  .object({
    tipo: z.enum(seguroImovelEnumerators.tipo).nullable().optional(),
    seguradora: z.string(),
    numeroApolice: z.string(),
    dataInicioRange: z.array(dateOptionalSchema).max(2),
    dataFimRange: z.array(dateOptionalSchema).max(2),
    valorPremioRange: z.array(numberOptionalSchema).max(2),
    valorCoberturaRange: z.array(numberOptionalSchema).max(2),
    status: z.enum(seguroImovelEnumerators.status).nullable().optional(),
    imovel: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const seguroImovelFindManyInputSchema = z.object({
  filter: seguroImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const seguroImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const seguroImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const seguroImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const seguroImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ numeroApolice: 'asc' }),
});

export const seguroImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  numeroApolice: z.string(),
});

export const seguroImovelCreateInputSchema = z.object({
  tipo: z.enum(seguroImovelEnumerators.tipo),
  seguradora: z.string().trim().min(1).max(150),
  numeroApolice: z.string().trim().min(1).min(1).max(100),
  dataInicio: dateOptionalSchema,
  dataFim: dateOptionalSchema,
  valorPremio: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorCobertura: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  status: z.enum(seguroImovelEnumerators.status),
  documentos: z.array(fileUploadedSchema).max(10).optional(),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  locacao: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const seguroImovelImportInputSchema = seguroImovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    documentos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const seguroImovelImportFileSchema = z
  .object({
    tipo: z.string(),
    seguradora: z.string(),
    numeroApolice: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    valorPremio: z.string(),
    valorCobertura: z.string(),
    status: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
    locacao: z.string(),
  })
  .partial();

export const seguroImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const seguroImovelUpdateBodyInputSchema = seguroImovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SeguroImovelWithRelationships extends SeguroImovel {
  imovel?: Imovel;
  locacao?: Locacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

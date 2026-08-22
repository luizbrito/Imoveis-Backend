import { Estado } from '../../prisma/generated/client';
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
import { estadoEnumerators } from './estadoEnumerators';
import { Cidade } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Pais } from '../../prisma/generated/client';

export const estadoFindSchema = z.object({
  id: z.string(),
});

export const estadoFilterInputSchema = z
  .object({
    nome: z.string(),
    sigla: z.string(),
    codigoOficial: z.string(),
    tipoDivisao: z.enum(estadoEnumerators.tipoDivisao).nullable().optional(),
    ativo: booleanStringOptionalSchema,
    pais: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const estadoFindManyInputSchema = z.object({
  filter: estadoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const estadoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const estadoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const estadoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const estadoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const estadoAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const estadoCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(120),
  sigla: z
    .string()
    .trim()
    .max(10)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  codigoOficial: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  tipoDivisao: z.enum(estadoEnumerators.tipoDivisao).nullable().optional(),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  pais: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const estadoImportInputSchema = estadoCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const estadoImportFileSchema = z
  .object({
    nome: z.string(),
    sigla: z.string(),
    codigoOficial: z.string(),
    tipoDivisao: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    cidades: z.string().transform((val) => val.split(' ')),
    imoveisEstado: z.string().transform((val) => val.split(' ')),
    pais: z.string(),
  })
  .partial();

export const estadoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const estadoUpdateBodyInputSchema = estadoCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface EstadoWithRelationships extends Estado {
  cidades?: Cidade[];
  imoveisEstado?: Imovel[];
  pais?: Pais;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

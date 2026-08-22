import { CategoriaFinanceira } from '../../prisma/generated/client';
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
import { categoriaFinanceiraEnumerators } from './categoriaFinanceiraEnumerators';
import { LancamentoFinanceiro } from '../../prisma/generated/client';

export const categoriaFinanceiraFindSchema = z.object({
  id: z.string(),
});

export const categoriaFinanceiraFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z.enum(categoriaFinanceiraEnumerators.tipo).nullable().optional(),
    grupo: z.string(),
    codigoContabil: z.string(),
    ativa: booleanStringOptionalSchema,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const categoriaFinanceiraFindManyInputSchema = z.object({
  filter: categoriaFinanceiraFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const categoriaFinanceiraDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const categoriaFinanceiraArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const categoriaFinanceiraRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const categoriaFinanceiraAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const categoriaFinanceiraAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const categoriaFinanceiraCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(120),
  tipo: z.enum(categoriaFinanceiraEnumerators.tipo),
  grupo: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  codigoContabil: z
    .string()
    .trim()
    .max(50)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativa: z.boolean().default(false),
  importHash: z.string().optional(),
});

export const categoriaFinanceiraImportInputSchema =
  categoriaFinanceiraCreateInputSchema.extend(importerInputSchema.shape);

export const categoriaFinanceiraImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    grupo: z.string(),
    codigoContabil: z.string(),
    ativa: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    lancamentos: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const categoriaFinanceiraUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const categoriaFinanceiraUpdateBodyInputSchema =
  categoriaFinanceiraCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CategoriaFinanceiraWithRelationships extends CategoriaFinanceira {
  lancamentos?: LancamentoFinanceiro[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

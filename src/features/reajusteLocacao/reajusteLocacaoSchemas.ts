import { ReajusteLocacao } from '../../prisma/generated/client';
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
import { fileUploadedSchema } from '../file/fileSchemas';
import { MemberWithRelationships } from '../member/memberSchemas';
import { reajusteLocacaoEnumerators } from './reajusteLocacaoEnumerators';
import { Locacao } from '../../prisma/generated/client';

export const reajusteLocacaoFindSchema = z.object({
  id: z.string(),
});

export const reajusteLocacaoFilterInputSchema = z
  .object({
    dataBaseRange: z.array(dateOptionalSchema).max(2),
    indice: z.enum(reajusteLocacaoEnumerators.indice).nullable().optional(),
    percentualRange: z.array(numberOptionalSchema).max(2),
    valorAnteriorRange: z.array(numberOptionalSchema).max(2),
    valorNovoRange: z.array(numberOptionalSchema).max(2),
    status: z.enum(reajusteLocacaoEnumerators.status).nullable().optional(),
    locacao: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const reajusteLocacaoFindManyInputSchema = z.object({
  filter: reajusteLocacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const reajusteLocacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reajusteLocacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reajusteLocacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reajusteLocacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ dataBase: 'asc' }),
});

export const reajusteLocacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  dataBase: z.string(),
});

export const reajusteLocacaoCreateInputSchema = z.object({
  dataBase: dateSchema,
  indice: z.enum(reajusteLocacaoEnumerators.indice),
  percentual: numberSchema.pipe(z.number().min(-100).max(1000)),
  valorAnterior: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorNovo: numberSchema.pipe(z.number().min(0)),
  status: z.enum(reajusteLocacaoEnumerators.status),
  documentos: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  locacao: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const reajusteLocacaoImportInputSchema = reajusteLocacaoCreateInputSchema
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

export const reajusteLocacaoImportFileSchema = z
  .object({
    dataBase: z.string(),
    indice: z.string(),
    percentual: z.string(),
    valorAnterior: z.string(),
    valorNovo: z.string(),
    status: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    locacao: z.string(),
  })
  .partial();

export const reajusteLocacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const reajusteLocacaoUpdateBodyInputSchema =
  reajusteLocacaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ReajusteLocacaoWithRelationships extends ReajusteLocacao {
  locacao?: Locacao;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

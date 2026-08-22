import { DocumentoPessoa } from '../../prisma/generated/client';
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
import { documentoPessoaEnumerators } from './documentoPessoaEnumerators';
import { Proprietario } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const documentoPessoaFindSchema = z.object({
  id: z.string(),
});

export const documentoPessoaFilterInputSchema = z
  .object({
    titulo: z.string(),
    tipo: z.enum(documentoPessoaEnumerators.tipo).nullable().optional(),
    numero: z.string(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataValidadeRange: z.array(dateOptionalSchema).max(2),
    statusValidacao: z
      .enum(documentoPessoaEnumerators.statusValidacao)
      .nullable()
      .optional(),
    proprietario: objectToUuidSchemaOptional,
    cliente: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const documentoPessoaFindManyInputSchema = z.object({
  filter: documentoPessoaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const documentoPessoaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoPessoaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoPessoaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const documentoPessoaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const documentoPessoaAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const documentoPessoaCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(documentoPessoaEnumerators.tipo),
  numero: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataEmissao: dateOptionalSchema,
  dataValidade: dateOptionalSchema,
  arquivos: z.array(fileUploadedSchema).min(1).max(10),
  statusValidacao: z.enum(documentoPessoaEnumerators.statusValidacao),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  proprietario: objectToUuidSchemaOptional,
  cliente: objectToUuidSchemaOptional,
  corretor: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const documentoPessoaImportInputSchema = documentoPessoaCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    arquivos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const documentoPessoaImportFileSchema = z
  .object({
    titulo: z.string(),
    tipo: z.string(),
    numero: z.string(),
    dataEmissao: z.string(),
    dataValidade: z.string(),
    arquivos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    statusValidacao: z.string(),
    observacoes: z.string(),
    proprietario: z.string(),
    cliente: z.string(),
    corretor: z.string(),
  })
  .partial();

export const documentoPessoaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const documentoPessoaUpdateBodyInputSchema =
  documentoPessoaCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DocumentoPessoaWithRelationships extends DocumentoPessoa {
  proprietario?: Proprietario;
  cliente?: Cliente;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

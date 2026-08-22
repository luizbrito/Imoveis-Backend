import { OcorrenciaImovel } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import { dateOptionalSchema } from '../../shared/schemas/dateSchema';
import {
  dateTimeOptionalSchema,
  dateTimeSchema,
} from '../../shared/schemas/dateTimeSchema';
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
import { ocorrenciaImovelEnumerators } from './ocorrenciaImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const ocorrenciaImovelFindSchema = z.object({
  id: z.string(),
});

export const ocorrenciaImovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataHoraRange: z.array(dateTimeOptionalSchema).max(2),
    tipo: z.enum(ocorrenciaImovelEnumerators.tipo).nullable().optional(),
    gravidade: z
      .enum(ocorrenciaImovelEnumerators.gravidade)
      .nullable()
      .optional(),
    status: z.enum(ocorrenciaImovelEnumerators.status).nullable().optional(),
    titulo: z.string(),
    dataResolucaoRange: z.array(dateTimeOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    clienteRelator: objectToUuidSchemaOptional,
    corretorResponsavel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const ocorrenciaImovelFindManyInputSchema = z.object({
  filter: ocorrenciaImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const ocorrenciaImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ocorrenciaImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ocorrenciaImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ocorrenciaImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const ocorrenciaImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const ocorrenciaImovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataHora: dateTimeSchema,
  tipo: z.enum(ocorrenciaImovelEnumerators.tipo),
  gravidade: z.enum(ocorrenciaImovelEnumerators.gravidade),
  status: z.enum(ocorrenciaImovelEnumerators.status),
  titulo: z.string().trim().min(1).max(180),
  descricao: z.string().trim().min(1).max(4000),
  anexos: z.array(fileUploadedSchema).max(15).optional(),
  dataResolucao: dateTimeOptionalSchema,
  resolucao: z
    .string()
    .trim()
    .max(3000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  locacao: objectToUuidSchemaOptional,
  clienteRelator: objectToUuidSchemaOptional,
  corretorResponsavel: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const ocorrenciaImovelImportInputSchema =
  ocorrenciaImovelCreateInputSchema.extend(importerInputSchema.shape).extend({
    anexos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const ocorrenciaImovelImportFileSchema = z
  .object({
    codigo: z.string(),
    dataHora: z.string(),
    tipo: z.string(),
    gravidade: z.string(),
    status: z.string(),
    titulo: z.string(),
    descricao: z.string(),
    anexos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    dataResolucao: z.string(),
    resolucao: z.string(),
    imovel: z.string(),
    locacao: z.string(),
    clienteRelator: z.string(),
    corretorResponsavel: z.string(),
  })
  .partial();

export const ocorrenciaImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const ocorrenciaImovelUpdateBodyInputSchema =
  ocorrenciaImovelCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface OcorrenciaImovelWithRelationships extends OcorrenciaImovel {
  imovel?: Imovel;
  locacao?: Locacao;
  clienteRelator?: Cliente;
  corretorResponsavel?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

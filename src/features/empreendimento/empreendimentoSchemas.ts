import { Empreendimento } from '../../prisma/generated/client';
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
import { empreendimentoEnumerators } from './empreendimentoEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { ArquivoKml } from '../../prisma/generated/client';

export const empreendimentoFindSchema = z.object({
  id: z.string(),
});

export const empreendimentoFilterInputSchema = z
  .object({
    nome: z.string(),
    incorporadora: z.string(),
    construtora: z.string(),
    status: z.enum(empreendimentoEnumerators.status).nullable().optional(),
    dataLancamentoRange: z.array(dateOptionalSchema).max(2),
    previsaoEntregaRange: z.array(dateOptionalSchema).max(2),
    cidade: z.string(),
    bairro: z.string(),
    endereco: z.string(),
    diferenciais: z.array(z.string()),
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const empreendimentoFindManyInputSchema = z.object({
  filter: empreendimentoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const empreendimentoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const empreendimentoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const empreendimentoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const empreendimentoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const empreendimentoAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const empreendimentoCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
  incorporadora: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  construtora: z
    .string()
    .trim()
    .max(150)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  status: z.enum(empreendimentoEnumerators.status),
  dataLancamento: dateOptionalSchema,
  previsaoEntrega: dateOptionalSchema,
  cidade: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  bairro: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  endereco: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  descricao: z
    .string()
    .trim()
    .max(5000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  diferenciais: z.array(z.string()).max(50).optional(),
  imagens: z.array(fileUploadedSchema).max(30).optional(),
  documentos: z.array(fileUploadedSchema).max(20).optional(),
  importHash: z.string().optional(),
});

export const empreendimentoImportInputSchema = empreendimentoCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    imagens: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    documentos: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const empreendimentoImportFileSchema = z
  .object({
    nome: z.string(),
    incorporadora: z.string(),
    construtora: z.string(),
    status: z.string(),
    dataLancamento: z.string(),
    previsaoEntrega: z.string(),
    cidade: z.string(),
    bairro: z.string(),
    endereco: z.string(),
    descricao: z.string(),
    diferenciais: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imagens: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    unidades: z.string().transform((val) => val.split(' ')),
    arquivosKml: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const empreendimentoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const empreendimentoUpdateBodyInputSchema =
  empreendimentoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface EmpreendimentoWithRelationships extends Empreendimento {
  unidades?: Imovel[];
  arquivosKml?: ArquivoKml[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

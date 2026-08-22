import { TipoSolo } from '../../prisma/generated/client';
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
import { tipoSoloEnumerators } from './tipoSoloEnumerators';
import { SoloImovelRural } from '../../prisma/generated/client';

export const tipoSoloFindSchema = z.object({
  id: z.string(),
});

export const tipoSoloFilterInputSchema = z
  .object({
    nome: z.string(),
    codigo: z.string(),
    classeTextural: z
      .enum(tipoSoloEnumerators.classeTextural)
      .nullable()
      .optional(),
    origem: z.string(),
    corPredominante: z.string(),
    drenagem: z.enum(tipoSoloEnumerators.drenagem).nullable().optional(),
    fertilidadeNatural: z
      .enum(tipoSoloEnumerators.fertilidadeNatural)
      .nullable()
      .optional(),
    materiaOrganica: z
      .enum(tipoSoloEnumerators.materiaOrganica)
      .nullable()
      .optional(),
    acidez: z.enum(tipoSoloEnumerators.acidez).nullable().optional(),
    riscoErosao: z.enum(tipoSoloEnumerators.riscoErosao).nullable().optional(),
    riscoCompactacao: z
      .enum(tipoSoloEnumerators.riscoCompactacao)
      .nullable()
      .optional(),
    riscoEncharcamento: z
      .enum(tipoSoloEnumerators.riscoEncharcamento)
      .nullable()
      .optional(),
    aptidaoAgricola: z
      .enum(tipoSoloEnumerators.aptidaoAgricola)
      .nullable()
      .optional(),
    aptidaoPastagem: z
      .enum(tipoSoloEnumerators.aptidaoPastagem)
      .nullable()
      .optional(),
    aptidaoFlorestal: z
      .enum(tipoSoloEnumerators.aptidaoFlorestal)
      .nullable()
      .optional(),
    fonteClassificacao: z.string(),
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const tipoSoloFindManyInputSchema = z.object({
  filter: tipoSoloFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const tipoSoloDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tipoSoloArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tipoSoloRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tipoSoloAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const tipoSoloAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const tipoSoloCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  codigo: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  descricao: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  classeTextural: z
    .enum(tipoSoloEnumerators.classeTextural)
    .nullable()
    .optional(),
  origem: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  corPredominante: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  drenagem: z.enum(tipoSoloEnumerators.drenagem).nullable().optional(),
  fertilidadeNatural: z
    .enum(tipoSoloEnumerators.fertilidadeNatural)
    .nullable()
    .optional(),
  materiaOrganica: z
    .enum(tipoSoloEnumerators.materiaOrganica)
    .nullable()
    .optional(),
  acidez: z.enum(tipoSoloEnumerators.acidez).nullable().optional(),
  riscoErosao: z.enum(tipoSoloEnumerators.riscoErosao).nullable().optional(),
  riscoCompactacao: z
    .enum(tipoSoloEnumerators.riscoCompactacao)
    .nullable()
    .optional(),
  riscoEncharcamento: z
    .enum(tipoSoloEnumerators.riscoEncharcamento)
    .nullable()
    .optional(),
  aptidaoAgricola: z
    .enum(tipoSoloEnumerators.aptidaoAgricola)
    .nullable()
    .optional(),
  aptidaoPastagem: z
    .enum(tipoSoloEnumerators.aptidaoPastagem)
    .nullable()
    .optional(),
  aptidaoFlorestal: z
    .enum(tipoSoloEnumerators.aptidaoFlorestal)
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  fonteClassificacao: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  mapaReferencia: z.array(fileUploadedSchema).optional(),
  importHash: z.string().optional(),
});

export const tipoSoloImportInputSchema = tipoSoloCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    mapaReferencia: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const tipoSoloImportFileSchema = z
  .object({
    nome: z.string(),
    codigo: z.string(),
    descricao: z.string(),
    classeTextural: z.string(),
    origem: z.string(),
    corPredominante: z.string(),
    drenagem: z.string(),
    fertilidadeNatural: z.string(),
    materiaOrganica: z.string(),
    acidez: z.string(),
    riscoErosao: z.string(),
    riscoCompactacao: z.string(),
    riscoEncharcamento: z.string(),
    aptidaoAgricola: z.string(),
    aptidaoPastagem: z.string(),
    aptidaoFlorestal: z.string(),
    observacoes: z.string(),
    fonteClassificacao: z.string(),
    mapaReferencia: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    areasImoveis: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const tipoSoloUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const tipoSoloUpdateBodyInputSchema = tipoSoloCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface TipoSoloWithRelationships extends TipoSolo {
  areasImoveis?: SoloImovelRural[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

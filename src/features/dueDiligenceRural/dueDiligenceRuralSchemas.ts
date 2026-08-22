import { DueDiligenceRural } from '../../prisma/generated/client';
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
import { dueDiligenceRuralEnumerators } from './dueDiligenceRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const dueDiligenceRuralFindSchema = z.object({
  id: z.string(),
});

export const dueDiligenceRuralFilterInputSchema = z
  .object({
    titulo: z.string(),
    dataAnaliseRange: z.array(dateOptionalSchema).max(2),
    status: z.enum(dueDiligenceRuralEnumerators.status).nullable().optional(),
    riscoFundiario: z
      .enum(dueDiligenceRuralEnumerators.riscoFundiario)
      .nullable()
      .optional(),
    riscoAmbiental: z
      .enum(dueDiligenceRuralEnumerators.riscoAmbiental)
      .nullable()
      .optional(),
    riscoFiscal: z
      .enum(dueDiligenceRuralEnumerators.riscoFiscal)
      .nullable()
      .optional(),
    riscoTrabalhista: z
      .enum(dueDiligenceRuralEnumerators.riscoTrabalhista)
      .nullable()
      .optional(),
    riscoDocumental: z
      .enum(dueDiligenceRuralEnumerators.riscoDocumental)
      .nullable()
      .optional(),
    notaDocumentacaoRange: z.array(numberOptionalSchema).max(2),
    notaInfraestruturaRange: z.array(numberOptionalSchema).max(2),
    notaLogisticaRange: z.array(numberOptionalSchema).max(2),
    notaRecursosHidricosRange: z.array(numberOptionalSchema).max(2),
    notaClimaRange: z.array(numberOptionalSchema).max(2),
    notaSoloRange: z.array(numberOptionalSchema).max(2),
    notaAptidaoAgricolaRange: z.array(numberOptionalSchema).max(2),
    notaAptidaoPecuariaRange: z.array(numberOptionalSchema).max(2),
    notaAmbientalRange: z.array(numberOptionalSchema).max(2),
    scoreGeralRange: z.array(numberOptionalSchema).max(2),
    classificacaoFinal: z
      .enum(dueDiligenceRuralEnumerators.classificacaoFinal)
      .nullable()
      .optional(),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const dueDiligenceRuralFindManyInputSchema = z.object({
  filter: dueDiligenceRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const dueDiligenceRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const dueDiligenceRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const dueDiligenceRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const dueDiligenceRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const dueDiligenceRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const dueDiligenceRuralCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(250),
  dataAnalise: dateOptionalSchema,
  status: z.enum(dueDiligenceRuralEnumerators.status).nullable().optional(),
  riscoFundiario: z
    .enum(dueDiligenceRuralEnumerators.riscoFundiario)
    .nullable()
    .optional(),
  riscoAmbiental: z
    .enum(dueDiligenceRuralEnumerators.riscoAmbiental)
    .nullable()
    .optional(),
  riscoFiscal: z
    .enum(dueDiligenceRuralEnumerators.riscoFiscal)
    .nullable()
    .optional(),
  riscoTrabalhista: z
    .enum(dueDiligenceRuralEnumerators.riscoTrabalhista)
    .nullable()
    .optional(),
  riscoDocumental: z
    .enum(dueDiligenceRuralEnumerators.riscoDocumental)
    .nullable()
    .optional(),
  notaDocumentacao: numberOptionalSchema.pipe(z.number().nullable().optional()),
  notaInfraestrutura: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  notaLogistica: numberOptionalSchema.pipe(z.number().nullable().optional()),
  notaRecursosHidricos: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  notaClima: numberOptionalSchema.pipe(z.number().nullable().optional()),
  notaSolo: numberOptionalSchema.pipe(z.number().nullable().optional()),
  notaAptidaoAgricola: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  notaAptidaoPecuaria: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  notaAmbiental: numberOptionalSchema.pipe(z.number().nullable().optional()),
  scoreGeral: numberOptionalSchema.pipe(z.number().nullable().optional()),
  classificacaoFinal: z
    .enum(dueDiligenceRuralEnumerators.classificacaoFinal)
    .nullable()
    .optional(),
  pendencias: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  recomendacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  relatorio: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const dueDiligenceRuralImportInputSchema =
  dueDiligenceRuralCreateInputSchema.extend(importerInputSchema.shape).extend({
    relatorio: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const dueDiligenceRuralImportFileSchema = z
  .object({
    titulo: z.string(),
    dataAnalise: z.string(),
    status: z.string(),
    riscoFundiario: z.string(),
    riscoAmbiental: z.string(),
    riscoFiscal: z.string(),
    riscoTrabalhista: z.string(),
    riscoDocumental: z.string(),
    notaDocumentacao: z.string(),
    notaInfraestrutura: z.string(),
    notaLogistica: z.string(),
    notaRecursosHidricos: z.string(),
    notaClima: z.string(),
    notaSolo: z.string(),
    notaAptidaoAgricola: z.string(),
    notaAptidaoPecuaria: z.string(),
    notaAmbiental: z.string(),
    scoreGeral: z.string(),
    classificacaoFinal: z.string(),
    pendencias: z.string(),
    recomendacoes: z.string(),
    relatorio: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const dueDiligenceRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const dueDiligenceRuralUpdateBodyInputSchema =
  dueDiligenceRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DueDiligenceRuralWithRelationships extends DueDiligenceRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

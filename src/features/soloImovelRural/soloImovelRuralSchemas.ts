import { SoloImovelRural } from '../../prisma/generated/client';
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
import { Imovel } from '../../prisma/generated/client';
import { TipoSolo } from '../../prisma/generated/client';

export const soloImovelRuralFindSchema = z.object({
  id: z.string(),
});

export const soloImovelRuralFilterInputSchema = z
  .object({
    nomeArea: z.string(),
    areaHaRange: z.array(numberOptionalSchema).max(2),
    percentualImovelRange: z.array(numberOptionalSchema).max(2),
    profundidadeMediaCmRange: z.array(numberOptionalSchema).max(2),
    declividadeMediaPercentualRange: z.array(numberOptionalSchema).max(2),
    phMedioRange: z.array(numberOptionalSchema).max(2),
    materiaOrganicaPercentualRange: z.array(numberOptionalSchema).max(2),
    teorArgilaPercentualRange: z.array(numberOptionalSchema).max(2),
    teorAreiaPercentualRange: z.array(numberOptionalSchema).max(2),
    teorSiltePercentualRange: z.array(numberOptionalSchema).max(2),
    capacidadeUso: z.string(),
    usoAtual: z.string(),
    usoRecomendado: z.string(),
    necessitaCorrecao: booleanStringOptionalSchema,
    analiseSoloDataRange: z.array(dateOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    tipoSolo: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const soloImovelRuralFindManyInputSchema = z.object({
  filter: soloImovelRuralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const soloImovelRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const soloImovelRuralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const soloImovelRuralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const soloImovelRuralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nomeArea: 'asc' }),
});

export const soloImovelRuralAutocompleteOutputSchema = z.object({
  id: z.string(),
  nomeArea: z.string(),
});

export const soloImovelRuralCreateInputSchema = z.object({
  nomeArea: z.string().trim().min(1).min(1).max(250),
  areaHa: numberOptionalSchema.pipe(z.number().nullable().optional()),
  percentualImovel: numberOptionalSchema.pipe(z.number().nullable().optional()),
  profundidadeMediaCm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  declividadeMediaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  phMedio: numberOptionalSchema.pipe(z.number().nullable().optional()),
  materiaOrganicaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  teorArgilaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  teorAreiaPercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  teorSiltePercentual: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  capacidadeUso: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  usoAtual: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  usoRecomendado: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  necessitaCorrecao: z.boolean().default(false),
  correcaoRecomendada: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  analiseSoloData: dateOptionalSchema,
  analiseSoloArquivo: z.array(fileUploadedSchema).optional(),
  mapaSoloArquivo: z.array(fileUploadedSchema).optional(),
  arquivoKmlSolo: z.array(fileUploadedSchema).optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  tipoSolo: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const soloImovelRuralImportInputSchema = soloImovelRuralCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    analiseSoloArquivo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    mapaSoloArquivo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    arquivoKmlSolo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const soloImovelRuralImportFileSchema = z
  .object({
    nomeArea: z.string(),
    areaHa: z.string(),
    percentualImovel: z.string(),
    profundidadeMediaCm: z.string(),
    declividadeMediaPercentual: z.string(),
    phMedio: z.string(),
    materiaOrganicaPercentual: z.string(),
    teorArgilaPercentual: z.string(),
    teorAreiaPercentual: z.string(),
    teorSiltePercentual: z.string(),
    capacidadeUso: z.string(),
    usoAtual: z.string(),
    usoRecomendado: z.string(),
    necessitaCorrecao: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    correcaoRecomendada: z.string(),
    analiseSoloData: z.string(),
    analiseSoloArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    mapaSoloArquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    arquivoKmlSolo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
    tipoSolo: z.string(),
  })
  .partial();

export const soloImovelRuralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const soloImovelRuralUpdateBodyInputSchema =
  soloImovelRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SoloImovelRuralWithRelationships extends SoloImovelRural {
  imovel?: Imovel;
  tipoSolo?: TipoSolo;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { CertificacaoSustentabilidadeRural } from '../../prisma/generated/client';
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
import { certificacaoSustentabilidadeRuralEnumerators } from './certificacaoSustentabilidadeRuralEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const certificacaoSustentabilidadeRuralFindSchema = z.object({
  id: z.string(),
});

export const certificacaoSustentabilidadeRuralFilterInputSchema = z
  .object({
    nome: z.string(),
    tipo: z
      .enum(certificacaoSustentabilidadeRuralEnumerators.tipo)
      .nullable()
      .optional(),
    entidadeCertificadora: z.string(),
    numeroCertificado: z.string(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataValidadeRange: z.array(dateOptionalSchema).max(2),
    status: z
      .enum(certificacaoSustentabilidadeRuralEnumerators.status)
      .nullable()
      .optional(),
    areaCertificadaHaRange: z.array(numberOptionalSchema).max(2),
    potencialCreditoCarbono: booleanStringOptionalSchema,
    projetoCarbonoAtivo: booleanStringOptionalSchema,
    estimativaCarbonoTco2eRange: z.array(numberOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const certificacaoSustentabilidadeRuralFindManyInputSchema = z.object({
  filter: certificacaoSustentabilidadeRuralFilterInputSchema
    .partial()
    .optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const certificacaoSustentabilidadeRuralDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const certificacaoSustentabilidadeRuralArchiveManyInputSchema = z.object(
  {
    ids: z.array(z.string()),
  },
);

export const certificacaoSustentabilidadeRuralRestoreManyInputSchema = z.object(
  {
    ids: z.array(z.string()),
  },
);

export const certificacaoSustentabilidadeRuralAutocompleteInputSchema =
  z.object({
    search: z.string().trim().optional(),
    exclude: z.array(z.uuid()).optional(),
    take: z.coerce.number().optional(),
    orderBy: orderBySchema.default({ nome: 'asc' }),
  });

export const certificacaoSustentabilidadeRuralAutocompleteOutputSchema =
  z.object({
    id: z.string(),
    nome: z.string(),
  });

export const certificacaoSustentabilidadeRuralCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(250),
  tipo: z
    .enum(certificacaoSustentabilidadeRuralEnumerators.tipo)
    .nullable()
    .optional(),
  entidadeCertificadora: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  numeroCertificado: z
    .string()
    .trim()
    .max(250)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataEmissao: dateOptionalSchema,
  dataValidade: dateOptionalSchema,
  status: z
    .enum(certificacaoSustentabilidadeRuralEnumerators.status)
    .nullable()
    .optional(),
  areaCertificadaHa: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  potencialCreditoCarbono: z.boolean().default(false),
  projetoCarbonoAtivo: z.boolean().default(false),
  estimativaCarbonoTco2e: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  documentos: z.array(fileUploadedSchema).optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const certificacaoSustentabilidadeRuralImportInputSchema =
  certificacaoSustentabilidadeRuralCreateInputSchema
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

export const certificacaoSustentabilidadeRuralImportFileSchema = z
  .object({
    nome: z.string(),
    tipo: z.string(),
    entidadeCertificadora: z.string(),
    numeroCertificado: z.string(),
    dataEmissao: z.string(),
    dataValidade: z.string(),
    status: z.string(),
    areaCertificadaHa: z.string(),
    potencialCreditoCarbono: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    projetoCarbonoAtivo: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    estimativaCarbonoTco2e: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    imovel: z.string(),
  })
  .partial();

export const certificacaoSustentabilidadeRuralUpdateParamsInputSchema =
  z.object({
    id: z.string(),
  });

export const certificacaoSustentabilidadeRuralUpdateBodyInputSchema =
  certificacaoSustentabilidadeRuralCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CertificacaoSustentabilidadeRuralWithRelationships extends CertificacaoSustentabilidadeRural {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

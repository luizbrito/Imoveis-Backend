import { ArquivoKml } from '../../prisma/generated/client';
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
import { arquivoKmlEnumerators } from './arquivoKmlEnumerators';
import { DocumentacaoRuralBrasil } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Empreendimento } from '../../prisma/generated/client';
import { Condominio } from '../../prisma/generated/client';

export const arquivoKmlFindSchema = z.object({
  id: z.string(),
});

export const arquivoKmlFilterInputSchema = z
  .object({
    nome: z.string(),
    tipoArquivo: z
      .enum(arquivoKmlEnumerators.tipoArquivo)
      .nullable()
      .optional(),
    versao: z.string(),
    statusProcessamento: z
      .enum(arquivoKmlEnumerators.statusProcessamento)
      .nullable()
      .optional(),
    sistemaReferencia: z.string(),
    camada: z.string(),
    visivel: booleanStringOptionalSchema,
    ordemExibicaoRange: z.array(numberOptionalSchema).max(2),
    quantidadePontosRange: z.array(numberOptionalSchema).max(2),
    quantidadeLinhasRange: z.array(numberOptionalSchema).max(2),
    quantidadePoligonosRange: z.array(numberOptionalSchema).max(2),
    areaCalculadaM2Range: z.array(numberOptionalSchema).max(2),
    dataProcessamentoRange: z.array(dateTimeOptionalSchema).max(2),
    checksumSha256: z.string(),
    origem: z.string(),
    documentacaoRuralBrasil: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    empreendimento: objectToUuidSchemaOptional,
    condominio: objectToUuidSchemaOptional,
    cadastradoPor: objectToUuidSchemaOptional,
    versaoAnterior: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const arquivoKmlFindManyInputSchema = z.object({
  filter: arquivoKmlFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const arquivoKmlDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const arquivoKmlArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const arquivoKmlRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const arquivoKmlAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const arquivoKmlAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const arquivoKmlCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
  tipoArquivo: z.enum(arquivoKmlEnumerators.tipoArquivo),
  arquivo: z.array(fileUploadedSchema).min(1).max(1),
  descricao: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  versao: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  statusProcessamento: z.enum(arquivoKmlEnumerators.statusProcessamento),
  sistemaReferencia: z
    .string()
    .trim()
    .max(50)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  camada: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  visivel: z.boolean().default(false),
  ordemExibicao: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  latitudeMin: numberOptionalSchema.pipe(
    z.number().min(-90).max(90).nullable().optional(),
  ),
  longitudeMin: numberOptionalSchema.pipe(
    z.number().min(-180).max(180).nullable().optional(),
  ),
  latitudeMax: numberOptionalSchema.pipe(
    z.number().min(-90).max(90).nullable().optional(),
  ),
  longitudeMax: numberOptionalSchema.pipe(
    z.number().min(-180).max(180).nullable().optional(),
  ),
  quantidadePontos: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  quantidadeLinhas: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  quantidadePoligonos: numberOptionalSchema.pipe(
    z.int().min(0).nullable().optional(),
  ),
  areaCalculadaM2: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  dataProcessamento: dateTimeOptionalSchema,
  erroProcessamento: z
    .string()
    .trim()
    .max(4000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  checksumSha256: z
    .string()
    .trim()
    .max(64)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  origem: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .max(4000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  documentacaoRuralBrasil: objectToUuidSchemaOptional,
  imovel: objectToUuidSchema,
  empreendimento: objectToUuidSchemaOptional,
  condominio: objectToUuidSchemaOptional,
  cadastradoPor: objectToUuidSchemaOptional,
  versaoAnterior: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const arquivoKmlImportInputSchema = arquivoKmlCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    arquivo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const arquivoKmlImportFileSchema = z
  .object({
    nome: z.string(),
    tipoArquivo: z.string(),
    arquivo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    descricao: z.string(),
    versao: z.string(),
    statusProcessamento: z.string(),
    sistemaReferencia: z.string(),
    camada: z.string(),
    visivel: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    ordemExibicao: z.string(),
    latitudeMin: z.string(),
    longitudeMin: z.string(),
    latitudeMax: z.string(),
    longitudeMax: z.string(),
    quantidadePontos: z.string(),
    quantidadeLinhas: z.string(),
    quantidadePoligonos: z.string(),
    areaCalculadaM2: z.string(),
    dataProcessamento: z.string(),
    erroProcessamento: z.string(),
    checksumSha256: z.string(),
    origem: z.string(),
    observacoes: z.string(),
    versoesPosteriores: z.string().transform((val) => val.split(' ')),
    documentacaoRuralBrasil: z.string(),
    imovel: z.string(),
    empreendimento: z.string(),
    condominio: z.string(),
    cadastradoPor: z.string(),
    versaoAnterior: z.string(),
  })
  .partial();

export const arquivoKmlUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const arquivoKmlUpdateBodyInputSchema = arquivoKmlCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ArquivoKmlWithRelationships extends ArquivoKml {
  versoesPosteriores?: ArquivoKml[];
  documentacaoRuralBrasil?: DocumentacaoRuralBrasil;
  imovel?: Imovel;
  empreendimento?: Empreendimento;
  condominio?: Condominio;
  cadastradoPor?: MemberWithRelationships;
  versaoAnterior?: ArquivoKml;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

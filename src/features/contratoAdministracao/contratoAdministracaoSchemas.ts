import { ContratoAdministracao } from '../../prisma/generated/client';
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
import { contratoAdministracaoEnumerators } from './contratoAdministracaoEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const contratoAdministracaoFindSchema = z.object({
  id: z.string(),
});

export const contratoAdministracaoFilterInputSchema = z
  .object({
    numero: z.string(),
    status: z
      .enum(contratoAdministracaoEnumerators.status)
      .nullable()
      .optional(),
    dataInicioRange: z.array(dateOptionalSchema).max(2),
    dataFimRange: z.array(dateOptionalSchema).max(2),
    taxaAdministracaoPercentualRange: z.array(numberOptionalSchema).max(2),
    taxaIntermediacaoPercentualRange: z.array(numberOptionalSchema).max(2),
    prazoRepasseDiasRange: z.array(numberOptionalSchema).max(2),
    autorizaManutencaoAteRange: z.array(numberOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const contratoAdministracaoFindManyInputSchema = z.object({
  filter: contratoAdministracaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const contratoAdministracaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoAdministracaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoAdministracaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const contratoAdministracaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ numero: 'asc' }),
});

export const contratoAdministracaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  numero: z.string(),
});

export const contratoAdministracaoCreateInputSchema = z.object({
  numero: z.string().trim().min(1).min(1).max(60),
  status: z.enum(contratoAdministracaoEnumerators.status),
  dataInicio: dateOptionalSchema,
  dataFim: dateOptionalSchema,
  taxaAdministracaoPercentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  taxaIntermediacaoPercentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  prazoRepasseDias: numberOptionalSchema.pipe(
    z.int().min(0).max(90).nullable().optional(),
  ),
  autorizaManutencaoAte: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  arquivos: z.array(fileUploadedSchema).max(15).optional(),
  observacoes: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  proprietario: objectToUuidSchema,
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const contratoAdministracaoImportInputSchema =
  contratoAdministracaoCreateInputSchema
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

export const contratoAdministracaoImportFileSchema = z
  .object({
    numero: z.string(),
    status: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    taxaAdministracaoPercentual: z.string(),
    taxaIntermediacaoPercentual: z.string(),
    prazoRepasseDias: z.string(),
    autorizaManutencaoAte: z.string(),
    arquivos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    imovel: z.string(),
    proprietario: z.string(),
    filial: z.string(),
  })
  .partial();

export const contratoAdministracaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const contratoAdministracaoUpdateBodyInputSchema =
  contratoAdministracaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ContratoAdministracaoWithRelationships extends ContratoAdministracao {
  imovel?: Imovel;
  proprietario?: Proprietario;
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

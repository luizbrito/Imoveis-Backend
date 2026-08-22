import { CaptacaoImovel } from '../../prisma/generated/client';
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
import { captacaoImovelEnumerators } from './captacaoImovelEnumerators';
import { Filial } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const captacaoImovelFindSchema = z.object({
  id: z.string(),
});

export const captacaoImovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataCaptacaoRange: z.array(dateOptionalSchema).max(2),
    tipo: z.enum(captacaoImovelEnumerators.tipo).nullable().optional(),
    status: z.enum(captacaoImovelEnumerators.status).nullable().optional(),
    dataInicioRange: z.array(dateOptionalSchema).max(2),
    dataFimRange: z.array(dateOptionalSchema).max(2),
    percentualComissaoVendaRange: z.array(numberOptionalSchema).max(2),
    percentualAdministracaoRange: z.array(numberOptionalSchema).max(2),
    valorMinimoAutorizadoRange: z.array(numberOptionalSchema).max(2),
    filial: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const captacaoImovelFindManyInputSchema = z.object({
  filter: captacaoImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const captacaoImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const captacaoImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const captacaoImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const captacaoImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const captacaoImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const captacaoImovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataCaptacao: dateSchema,
  tipo: z.enum(captacaoImovelEnumerators.tipo),
  status: z.enum(captacaoImovelEnumerators.status),
  dataInicio: dateOptionalSchema,
  dataFim: dateOptionalSchema,
  percentualComissaoVenda: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  percentualAdministracao: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  valorMinimoAutorizado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  documentos: z.array(fileUploadedSchema).max(10).optional(),
  observacoes: z
    .string()
    .trim()
    .max(3000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  imovel: objectToUuidSchema,
  proprietario: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const captacaoImovelImportInputSchema = captacaoImovelCreateInputSchema
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

export const captacaoImovelImportFileSchema = z
  .object({
    codigo: z.string(),
    dataCaptacao: z.string(),
    tipo: z.string(),
    status: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    percentualComissaoVenda: z.string(),
    percentualAdministracao: z.string(),
    valorMinimoAutorizado: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    filial: z.string(),
    imovel: z.string(),
    proprietario: z.string(),
    corretor: z.string(),
  })
  .partial();

export const captacaoImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const captacaoImovelUpdateBodyInputSchema =
  captacaoImovelCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CaptacaoImovelWithRelationships extends CaptacaoImovel {
  filial?: Filial;
  imovel?: Imovel;
  proprietario?: Proprietario;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

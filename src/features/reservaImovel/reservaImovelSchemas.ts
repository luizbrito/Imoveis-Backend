import { ReservaImovel } from '../../prisma/generated/client';
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
import { reservaImovelEnumerators } from './reservaImovelEnumerators';
import { Proposta } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const reservaImovelFindSchema = z.object({
  id: z.string(),
});

export const reservaImovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataInicioRange: z.array(dateTimeOptionalSchema).max(2),
    dataFimRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(reservaImovelEnumerators.status).nullable().optional(),
    valorSinalRange: z.array(numberOptionalSchema).max(2),
    formaPagamentoSinal: z
      .enum(reservaImovelEnumerators.formaPagamentoSinal)
      .nullable()
      .optional(),
    proposta: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    cliente: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const reservaImovelFindManyInputSchema = z.object({
  filter: reservaImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const reservaImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reservaImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reservaImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const reservaImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const reservaImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const reservaImovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataInicio: dateTimeSchema,
  dataFim: dateTimeOptionalSchema,
  status: z.enum(reservaImovelEnumerators.status),
  valorSinal: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  formaPagamentoSinal: z
    .enum(reservaImovelEnumerators.formaPagamentoSinal)
    .nullable()
    .optional(),
  comprovante: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  proposta: objectToUuidSchemaOptional,
  imovel: objectToUuidSchema,
  cliente: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const reservaImovelImportInputSchema = reservaImovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    comprovante: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const reservaImovelImportFileSchema = z
  .object({
    codigo: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    status: z.string(),
    valorSinal: z.string(),
    formaPagamentoSinal: z.string(),
    comprovante: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    proposta: z.string(),
    imovel: z.string(),
    cliente: z.string(),
    corretor: z.string(),
  })
  .partial();

export const reservaImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const reservaImovelUpdateBodyInputSchema = reservaImovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ReservaImovelWithRelationships extends ReservaImovel {
  proposta?: Proposta;
  imovel?: Imovel;
  cliente?: Cliente;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

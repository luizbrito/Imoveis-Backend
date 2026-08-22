import { ConsentimentoLGPD } from '../../prisma/generated/client';
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
import { consentimentoLGPDEnumerators } from './consentimentoLGPDEnumerators';
import { Cliente } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';

export const consentimentoLGPDFindSchema = z.object({
  id: z.string(),
});

export const consentimentoLGPDFilterInputSchema = z
  .object({
    tipo: z.enum(consentimentoLGPDEnumerators.tipo).nullable().optional(),
    versaoTermo: z.string(),
    dataConsentimentoRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(consentimentoLGPDEnumerators.status).nullable().optional(),
    dataRevogacaoRange: z.array(dateTimeOptionalSchema).max(2),
    ipOrigem: z.string(),
    canal: z.enum(consentimentoLGPDEnumerators.canal).nullable().optional(),
    cliente: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    lead: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const consentimentoLGPDFindManyInputSchema = z.object({
  filter: consentimentoLGPDFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const consentimentoLGPDDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const consentimentoLGPDArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const consentimentoLGPDRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const consentimentoLGPDAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ tipo: 'asc' }),
});

export const consentimentoLGPDAutocompleteOutputSchema = z.object({
  id: z.string(),
  tipo: z.string(),
});

export const consentimentoLGPDCreateInputSchema = z.object({
  tipo: z.enum(consentimentoLGPDEnumerators.tipo),
  versaoTermo: z.string().trim().min(1).max(40),
  dataConsentimento: dateTimeSchema,
  status: z.enum(consentimentoLGPDEnumerators.status),
  dataRevogacao: dateTimeOptionalSchema,
  ipOrigem: z
    .string()
    .trim()
    .max(60)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  canal: z.enum(consentimentoLGPDEnumerators.canal).nullable().optional(),
  comprovante: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cliente: objectToUuidSchemaOptional,
  proprietario: objectToUuidSchemaOptional,
  lead: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const consentimentoLGPDImportInputSchema =
  consentimentoLGPDCreateInputSchema.extend(importerInputSchema.shape).extend({
    comprovante: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const consentimentoLGPDImportFileSchema = z
  .object({
    tipo: z.string(),
    versaoTermo: z.string(),
    dataConsentimento: z.string(),
    status: z.string(),
    dataRevogacao: z.string(),
    ipOrigem: z.string(),
    canal: z.string(),
    comprovante: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    cliente: z.string(),
    proprietario: z.string(),
    lead: z.string(),
  })
  .partial();

export const consentimentoLGPDUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const consentimentoLGPDUpdateBodyInputSchema =
  consentimentoLGPDCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ConsentimentoLGPDWithRelationships extends ConsentimentoLGPD {
  cliente?: Cliente;
  proprietario?: Proprietario;
  lead?: Lead;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

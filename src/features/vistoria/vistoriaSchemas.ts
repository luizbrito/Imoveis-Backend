import { Vistoria } from '../../prisma/generated/client';
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
import { vistoriaEnumerators } from './vistoriaEnumerators';
import { ItemVistoria } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const vistoriaFindSchema = z.object({
  id: z.string(),
});

export const vistoriaFilterInputSchema = z
  .object({
    codigo: z.string(),
    tipo: z.enum(vistoriaEnumerators.tipo).nullable().optional(),
    dataAgendadaRange: z.array(dateTimeOptionalSchema).max(2),
    dataRealizadaRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(vistoriaEnumerators.status).nullable().optional(),
    responsavelNome: z.string(),
    imovel: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const vistoriaFindManyInputSchema = z.object({
  filter: vistoriaFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const vistoriaDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vistoriaArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vistoriaRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const vistoriaAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const vistoriaAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const vistoriaCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  tipo: z.enum(vistoriaEnumerators.tipo),
  dataAgendada: dateTimeOptionalSchema,
  dataRealizada: dateTimeOptionalSchema,
  status: z.enum(vistoriaEnumerators.status),
  responsavelNome: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  assinaturaResponsavel: z.array(fileUploadedSchema).max(5).optional(),
  parecerGeral: z
    .string()
    .trim()
    .max(5000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  corretor: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const vistoriaImportInputSchema = vistoriaCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    assinaturaResponsavel: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const vistoriaImportFileSchema = z
  .object({
    codigo: z.string(),
    tipo: z.string(),
    dataAgendada: z.string(),
    dataRealizada: z.string(),
    status: z.string(),
    responsavelNome: z.string(),
    assinaturaResponsavel: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    parecerGeral: z.string(),
    itens: z.string().transform((val) => val.split(' ')),
    imovel: z.string(),
    corretor: z.string(),
  })
  .partial();

export const vistoriaUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const vistoriaUpdateBodyInputSchema = vistoriaCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface VistoriaWithRelationships extends Vistoria {
  itens?: ItemVistoria[];
  imovel?: Imovel;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

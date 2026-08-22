import { Condominio } from '../../prisma/generated/client';
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
import { MemberWithRelationships } from '../member/memberSchemas';
import { condominioEnumerators } from './condominioEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { ArquivoKml } from '../../prisma/generated/client';

export const condominioFindSchema = z.object({
  id: z.string(),
});

export const condominioFilterInputSchema = z
  .object({
    nome: z.string(),
    cnpj: z.string(),
    tipo: z.enum(condominioEnumerators.tipo).nullable().optional(),
    telefoneAdministracao: z.string(),
    emailAdministracao: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.enum(condominioEnumerators.uf).nullable().optional(),
    cep: z.string(),
    valorCondominioReferenciaRange: z.array(numberOptionalSchema).max(2),
    infraestrutura: z.array(z.string()),
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const condominioFindManyInputSchema = z.object({
  filter: condominioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const condominioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condominioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condominioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const condominioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const condominioAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const condominioCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
  cnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  tipo: z.enum(condominioEnumerators.tipo).nullable().optional(),
  telefoneAdministracao: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  emailAdministracao: z
    .string()
    .trim()
    .max(150)
    .email()
    .toLowerCase()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  logradouro: z
    .string()
    .trim()
    .max(180)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  numero: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  bairro: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  cidade: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  uf: z.enum(condominioEnumerators.uf).nullable().optional(),
  cep: z
    .string()
    .trim()
    .max(12)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  valorCondominioReferencia: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  infraestrutura: z.array(z.string()).max(50).optional(),
  regras: z
    .string()
    .trim()
    .max(3000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  importHash: z.string().optional(),
});

export const condominioImportInputSchema = condominioCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const condominioImportFileSchema = z
  .object({
    nome: z.string(),
    cnpj: z.string(),
    tipo: z.string(),
    telefoneAdministracao: z.string(),
    emailAdministracao: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string(),
    cep: z.string(),
    valorCondominioReferencia: z.string(),
    infraestrutura: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    regras: z.string(),
    imoveis: z.string().transform((val) => val.split(' ')),
    arquivosKml: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const condominioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const condominioUpdateBodyInputSchema = condominioCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CondominioWithRelationships extends Condominio {
  imoveis?: Imovel[];
  arquivosKml?: ArquivoKml[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

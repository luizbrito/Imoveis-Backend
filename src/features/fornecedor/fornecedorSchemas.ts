import { Fornecedor } from '../../prisma/generated/client';
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
import { fornecedorEnumerators } from './fornecedorEnumerators';
import { OrdemServico } from '../../prisma/generated/client';
import { DespesaImovel } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const fornecedorFindSchema = z.object({
  id: z.string(),
});

export const fornecedorFilterInputSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z.enum(fornecedorEnumerators.tipoPessoa).nullable().optional(),
    cpfCnpj: z.string(),
    categorias: z.array(z.enum(fornecedorEnumerators.categorias)),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    cidade: z.string(),
    uf: z.enum(fornecedorEnumerators.uf).nullable().optional(),
    avaliacaoRange: z.array(numberOptionalSchema).max(2),
    ativo: booleanStringOptionalSchema,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const fornecedorFindManyInputSchema = z.object({
  filter: fornecedorFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const fornecedorDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fornecedorArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fornecedorRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fornecedorAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nomeRazaoSocial: 'asc' }),
});

export const fornecedorAutocompleteOutputSchema = z.object({
  id: z.string(),
  nomeRazaoSocial: z.string(),
});

export const fornecedorCreateInputSchema = z.object({
  nomeRazaoSocial: z.string().trim().min(1).min(1).max(180),
  tipoPessoa: z.enum(fornecedorEnumerators.tipoPessoa).nullable().optional(),
  cpfCnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  categorias: z
    .array(z.enum(fornecedorEnumerators.categorias))
    .max(12)
    .optional(),
  telefone: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .max(150)
    .email()
    .toLowerCase()
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
  uf: z.enum(fornecedorEnumerators.uf).nullable().optional(),
  avaliacao: numberOptionalSchema.pipe(
    z.number().min(0).max(5).nullable().optional(),
  ),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const fornecedorImportInputSchema = fornecedorCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const fornecedorImportFileSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z.string(),
    cpfCnpj: z.string(),
    categorias: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    cidade: z.string(),
    uf: z.string(),
    avaliacao: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    ordensServico: z.string().transform((val) => val.split(' ')),
    despesas: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
  })
  .partial();

export const fornecedorUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const fornecedorUpdateBodyInputSchema = fornecedorCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface FornecedorWithRelationships extends Fornecedor {
  ordensServico?: OrdemServico[];
  despesas?: DespesaImovel[];
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

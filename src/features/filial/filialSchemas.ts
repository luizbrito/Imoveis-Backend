import { Filial } from '../../prisma/generated/client';
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
import { filialEnumerators } from './filialEnumerators';
import { Corretor } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { CampanhaMarketing } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { ContaFinanceira } from '../../prisma/generated/client';
import { Fornecedor } from '../../prisma/generated/client';
import { CaptacaoImovel } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { ContratoAdministracao } from '../../prisma/generated/client';

export const filialFindSchema = z.object({
  id: z.string(),
});

export const filialFilterInputSchema = z
  .object({
    nome: z.string(),
    codigo: z.string(),
    cnpj: z.string(),
    telefone: z.string(),
    email: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.enum(filialEnumerators.uf).nullable().optional(),
    cep: z.string(),
    ativa: booleanStringOptionalSchema,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const filialFindManyInputSchema = z.object({
  filter: filialFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const filialDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const filialArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const filialRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const filialAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const filialAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const filialCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(150),
  codigo: z.string().trim().min(1).max(30),
  cnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  telefone: z
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
  complemento: z
    .string()
    .trim()
    .max(100)
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
  uf: z.enum(filialEnumerators.uf).nullable().optional(),
  cep: z
    .string()
    .trim()
    .max(12)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  ativa: z.boolean().default(false),
  importHash: z.string().optional(),
});

export const filialImportInputSchema = filialCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const filialImportFileSchema = z
  .object({
    nome: z.string(),
    codigo: z.string(),
    cnpj: z.string(),
    telefone: z.string(),
    email: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string(),
    cep: z.string(),
    ativa: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    corretores: z.string().transform((val) => val.split(' ')),
    proprietarios: z.string().transform((val) => val.split(' ')),
    clientes: z.string().transform((val) => val.split(' ')),
    imoveis: z.string().transform((val) => val.split(' ')),
    leads: z.string().transform((val) => val.split(' ')),
    campanhasMarketing: z.string().transform((val) => val.split(' ')),
    vendas: z.string().transform((val) => val.split(' ')),
    locacoes: z.string().transform((val) => val.split(' ')),
    contasFinanceiras: z.string().transform((val) => val.split(' ')),
    fornecedores: z.string().transform((val) => val.split(' ')),
    captacoesImovel: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    contratosAdministracao: z.string().transform((val) => val.split(' ')),
  })
  .partial();

export const filialUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const filialUpdateBodyInputSchema = filialCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface FilialWithRelationships extends Filial {
  corretores?: Corretor[];
  proprietarios?: Proprietario[];
  clientes?: Cliente[];
  imoveis?: Imovel[];
  leads?: Lead[];
  campanhasMarketing?: CampanhaMarketing[];
  vendas?: Venda[];
  locacoes?: Locacao[];
  contasFinanceiras?: ContaFinanceira[];
  fornecedores?: Fornecedor[];
  captacoesImovel?: CaptacaoImovel[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  contratosAdministracao?: ContratoAdministracao[];
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

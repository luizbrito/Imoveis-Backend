import { Proprietario } from '../../prisma/generated/client';
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
import { proprietarioEnumerators } from './proprietarioEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { CaptacaoImovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { RepasseProprietario } from '../../prisma/generated/client';
import { DocumentoPessoa } from '../../prisma/generated/client';
import { ConsentimentoLGPD } from '../../prisma/generated/client';
import { ContratoAdministracao } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const proprietarioFindSchema = z.object({
  id: z.string(),
});

export const proprietarioFilterInputSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z
      .enum(proprietarioEnumerators.tipoPessoa)
      .nullable()
      .optional(),
    cpfCnpj: z.string(),
    rgInscricaoEstadual: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.enum(proprietarioEnumerators.uf).nullable().optional(),
    cep: z.string(),
    ativo: booleanStringOptionalSchema,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const proprietarioFindManyInputSchema = z.object({
  filter: proprietarioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const proprietarioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const proprietarioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const proprietarioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const proprietarioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nomeRazaoSocial: 'asc' }),
});

export const proprietarioAutocompleteOutputSchema = z.object({
  id: z.string(),
  nomeRazaoSocial: z.string(),
});

export const proprietarioCreateInputSchema = z.object({
  nomeRazaoSocial: z.string().trim().min(1).min(1).max(180),
  tipoPessoa: z.enum(proprietarioEnumerators.tipoPessoa),
  cpfCnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  rgInscricaoEstadual: z
    .string()
    .trim()
    .max(40)
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
  uf: z.enum(proprietarioEnumerators.uf).nullable().optional(),
  cep: z
    .string()
    .trim()
    .max(12)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dadosBancarios: z
    .string()
    .trim()
    .max(1000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
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

export const proprietarioImportInputSchema =
  proprietarioCreateInputSchema.extend(importerInputSchema.shape);

export const proprietarioImportFileSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z.string(),
    cpfCnpj: z.string(),
    rgInscricaoEstadual: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string(),
    cep: z.string(),
    dadosBancarios: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    imoveis: z.string().transform((val) => val.split(' ')),
    captacoes: z.string().transform((val) => val.split(' ')),
    vendasComoProprietario: z.string().transform((val) => val.split(' ')),
    locacoes: z.string().transform((val) => val.split(' ')),
    repasses: z.string().transform((val) => val.split(' ')),
    documentosPessoais: z.string().transform((val) => val.split(' ')),
    consentimentos: z.string().transform((val) => val.split(' ')),
    contratosAdministracao: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
  })
  .partial();

export const proprietarioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const proprietarioUpdateBodyInputSchema = proprietarioCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ProprietarioWithRelationships extends Proprietario {
  imoveis?: Imovel[];
  captacoes?: CaptacaoImovel[];
  vendasComoProprietario?: Venda[];
  locacoes?: Locacao[];
  repasses?: RepasseProprietario[];
  documentosPessoais?: DocumentoPessoa[];
  consentimentos?: ConsentimentoLGPD[];
  contratosAdministracao?: ContratoAdministracao[];
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { LancamentoFinanceiro } from '../../prisma/generated/client';
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
import { lancamentoFinanceiroEnumerators } from './lancamentoFinanceiroEnumerators';
import { Filial } from '../../prisma/generated/client';
import { ContaFinanceira } from '../../prisma/generated/client';
import { CategoriaFinanceira } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { CobrancaLocacao } from '../../prisma/generated/client';
import { RepasseProprietario } from '../../prisma/generated/client';
import { Comissao } from '../../prisma/generated/client';
import { DespesaImovel } from '../../prisma/generated/client';

export const lancamentoFinanceiroFindSchema = z.object({
  id: z.string(),
});

export const lancamentoFinanceiroFilterInputSchema = z
  .object({
    descricao: z.string(),
    tipo: z.enum(lancamentoFinanceiroEnumerators.tipo).nullable().optional(),
    status: z
      .enum(lancamentoFinanceiroEnumerators.status)
      .nullable()
      .optional(),
    dataCompetenciaRange: z.array(dateOptionalSchema).max(2),
    dataVencimentoRange: z.array(dateOptionalSchema).max(2),
    dataRealizacaoRange: z.array(dateOptionalSchema).max(2),
    valorRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(lancamentoFinanceiroEnumerators.moeda).nullable().optional(),
    formaPagamento: z
      .enum(lancamentoFinanceiroEnumerators.formaPagamento)
      .nullable()
      .optional(),
    filial: objectToUuidSchemaOptional,
    contaFinanceira: objectToUuidSchemaOptional,
    categoriaFinanceira: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    venda: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    cobrancaLocacao: objectToUuidSchemaOptional,
    repasseProprietario: objectToUuidSchemaOptional,
    comissao: objectToUuidSchemaOptional,
    despesaImovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const lancamentoFinanceiroFindManyInputSchema = z.object({
  filter: lancamentoFinanceiroFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const lancamentoFinanceiroDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const lancamentoFinanceiroArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const lancamentoFinanceiroRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const lancamentoFinanceiroAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ descricao: 'asc' }),
});

export const lancamentoFinanceiroAutocompleteOutputSchema = z.object({
  id: z.string(),
  descricao: z.string(),
});

export const lancamentoFinanceiroCreateInputSchema = z.object({
  descricao: z.string().trim().min(1).min(1).max(180),
  tipo: z.enum(lancamentoFinanceiroEnumerators.tipo),
  status: z.enum(lancamentoFinanceiroEnumerators.status),
  dataCompetencia: dateSchema,
  dataVencimento: dateOptionalSchema,
  dataRealizacao: dateOptionalSchema,
  valor: numberSchema.pipe(z.number()),
  moeda: z.enum(lancamentoFinanceiroEnumerators.moeda),
  formaPagamento: z
    .enum(lancamentoFinanceiroEnumerators.formaPagamento)
    .nullable()
    .optional(),
  documentos: z.array(fileUploadedSchema).max(10).optional(),
  observacoes: z
    .string()
    .trim()
    .max(2000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  contaFinanceira: objectToUuidSchema,
  categoriaFinanceira: objectToUuidSchema,
  imovel: objectToUuidSchemaOptional,
  venda: objectToUuidSchemaOptional,
  locacao: objectToUuidSchemaOptional,
  cobrancaLocacao: objectToUuidSchemaOptional,
  repasseProprietario: objectToUuidSchemaOptional,
  comissao: objectToUuidSchemaOptional,
  despesaImovel: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const lancamentoFinanceiroImportInputSchema =
  lancamentoFinanceiroCreateInputSchema
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

export const lancamentoFinanceiroImportFileSchema = z
  .object({
    descricao: z.string(),
    tipo: z.string(),
    status: z.string(),
    dataCompetencia: z.string(),
    dataVencimento: z.string(),
    dataRealizacao: z.string(),
    valor: z.string(),
    moeda: z.string(),
    formaPagamento: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    filial: z.string(),
    contaFinanceira: z.string(),
    categoriaFinanceira: z.string(),
    imovel: z.string(),
    venda: z.string(),
    locacao: z.string(),
    cobrancaLocacao: z.string(),
    repasseProprietario: z.string(),
    comissao: z.string(),
    despesaImovel: z.string(),
  })
  .partial();

export const lancamentoFinanceiroUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const lancamentoFinanceiroUpdateBodyInputSchema =
  lancamentoFinanceiroCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface LancamentoFinanceiroWithRelationships extends LancamentoFinanceiro {
  filial?: Filial;
  contaFinanceira?: ContaFinanceira;
  categoriaFinanceira?: CategoriaFinanceira;
  imovel?: Imovel;
  venda?: Venda;
  locacao?: Locacao;
  cobrancaLocacao?: CobrancaLocacao;
  repasseProprietario?: RepasseProprietario;
  comissao?: Comissao;
  despesaImovel?: DespesaImovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

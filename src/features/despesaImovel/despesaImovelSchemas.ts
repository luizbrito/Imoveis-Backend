import { DespesaImovel } from '../../prisma/generated/client';
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
import { despesaImovelEnumerators } from './despesaImovelEnumerators';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Fornecedor } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { OrdemServico } from '../../prisma/generated/client';

export const despesaImovelFindSchema = z.object({
  id: z.string(),
});

export const despesaImovelFilterInputSchema = z
  .object({
    descricao: z.string(),
    categoria: z.enum(despesaImovelEnumerators.categoria).nullable().optional(),
    dataCompetenciaRange: z.array(dateOptionalSchema).max(2),
    dataVencimentoRange: z.array(dateOptionalSchema).max(2),
    dataPagamentoRange: z.array(dateOptionalSchema).max(2),
    valorRange: z.array(numberOptionalSchema).max(2),
    status: z.enum(despesaImovelEnumerators.status).nullable().optional(),
    responsavelPagamento: z
      .enum(despesaImovelEnumerators.responsavelPagamento)
      .nullable()
      .optional(),
    imovel: objectToUuidSchemaOptional,
    fornecedor: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    ordemServico: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const despesaImovelFindManyInputSchema = z.object({
  filter: despesaImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const despesaImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const despesaImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const despesaImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const despesaImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ descricao: 'asc' }),
});

export const despesaImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  descricao: z.string(),
});

export const despesaImovelCreateInputSchema = z.object({
  descricao: z.string().trim().min(1).min(1).max(180),
  categoria: z.enum(despesaImovelEnumerators.categoria),
  dataCompetencia: dateOptionalSchema,
  dataVencimento: dateOptionalSchema,
  dataPagamento: dateOptionalSchema,
  valor: numberSchema.pipe(z.number().min(0)),
  status: z.enum(despesaImovelEnumerators.status),
  responsavelPagamento: z
    .enum(despesaImovelEnumerators.responsavelPagamento)
    .nullable()
    .optional(),
  documentos: z.array(fileUploadedSchema).max(10).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  fornecedor: objectToUuidSchemaOptional,
  locacao: objectToUuidSchemaOptional,
  ordemServico: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const despesaImovelImportInputSchema = despesaImovelCreateInputSchema
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

export const despesaImovelImportFileSchema = z
  .object({
    descricao: z.string(),
    categoria: z.string(),
    dataCompetencia: z.string(),
    dataVencimento: z.string(),
    dataPagamento: z.string(),
    valor: z.string(),
    status: z.string(),
    responsavelPagamento: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    imovel: z.string(),
    fornecedor: z.string(),
    locacao: z.string(),
    ordemServico: z.string(),
  })
  .partial();

export const despesaImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const despesaImovelUpdateBodyInputSchema = despesaImovelCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface DespesaImovelWithRelationships extends DespesaImovel {
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  imovel?: Imovel;
  fornecedor?: Fornecedor;
  locacao?: Locacao;
  ordemServico?: OrdemServico;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { Comissao } from '../../prisma/generated/client';
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
import { comissaoEnumerators } from './comissaoEnumerators';
import { PagamentoComissao } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const comissaoFindSchema = z.object({
  id: z.string(),
});

export const comissaoFilterInputSchema = z
  .object({
    codigo: z.string(),
    tipo: z.enum(comissaoEnumerators.tipo).nullable().optional(),
    baseCalculoRange: z.array(numberOptionalSchema).max(2),
    percentualRange: z.array(numberOptionalSchema).max(2),
    valorComissaoRange: z.array(numberOptionalSchema).max(2),
    status: z.enum(comissaoEnumerators.status).nullable().optional(),
    dataCompetenciaRange: z.array(dateOptionalSchema).max(2),
    venda: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const comissaoFindManyInputSchema = z.object({
  filter: comissaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const comissaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const comissaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const comissaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const comissaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const comissaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const comissaoCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  tipo: z.enum(comissaoEnumerators.tipo),
  baseCalculo: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  percentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  valorComissao: numberSchema.pipe(z.number().min(0)),
  status: z.enum(comissaoEnumerators.status),
  dataCompetencia: dateOptionalSchema,
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  venda: objectToUuidSchemaOptional,
  locacao: objectToUuidSchemaOptional,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const comissaoImportInputSchema = comissaoCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const comissaoImportFileSchema = z
  .object({
    codigo: z.string(),
    tipo: z.string(),
    baseCalculo: z.string(),
    percentual: z.string(),
    valorComissao: z.string(),
    status: z.string(),
    dataCompetencia: z.string(),
    observacoes: z.string(),
    pagamentos: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    venda: z.string(),
    locacao: z.string(),
    corretor: z.string(),
  })
  .partial();

export const comissaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const comissaoUpdateBodyInputSchema = comissaoCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ComissaoWithRelationships extends Comissao {
  pagamentos?: PagamentoComissao[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  venda?: Venda;
  locacao?: Locacao;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

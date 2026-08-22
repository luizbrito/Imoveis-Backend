import { Locacao } from '../../prisma/generated/client';
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
import { locacaoEnumerators } from './locacaoEnumerators';
import { ParticipanteLocacao } from '../../prisma/generated/client';
import { GarantiaLocacao } from '../../prisma/generated/client';
import { ContratoLocacao } from '../../prisma/generated/client';
import { CobrancaLocacao } from '../../prisma/generated/client';
import { ReajusteLocacao } from '../../prisma/generated/client';
import { RepasseProprietario } from '../../prisma/generated/client';
import { Comissao } from '../../prisma/generated/client';
import { SolicitacaoManutencao } from '../../prisma/generated/client';
import { DespesaImovel } from '../../prisma/generated/client';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { SeguroImovel } from '../../prisma/generated/client';
import { OcorrenciaImovel } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const locacaoFindSchema = z.object({
  id: z.string(),
});

export const locacaoFilterInputSchema = z
  .object({
    codigo: z.string(),
    status: z.enum(locacaoEnumerators.status).nullable().optional(),
    dataInicioRange: z.array(dateOptionalSchema).max(2),
    dataFimRange: z.array(dateOptionalSchema).max(2),
    valorAluguelRange: z.array(numberOptionalSchema).max(2),
    valorCondominioRange: z.array(numberOptionalSchema).max(2),
    valorIptuMensalRange: z.array(numberOptionalSchema).max(2),
    taxaAdministracaoPercentualRange: z.array(numberOptionalSchema).max(2),
    diaVencimentoRange: z.array(numberOptionalSchema).max(2),
    indiceReajuste: z
      .enum(locacaoEnumerators.indiceReajuste)
      .nullable()
      .optional(),
    periodicidadeReajusteMesesRange: z.array(numberOptionalSchema).max(2),
    multaAtrasoPercentualRange: z.array(numberOptionalSchema).max(2),
    jurosMesPercentualRange: z.array(numberOptionalSchema).max(2),
    filial: objectToUuidSchemaOptional,
    proposta: objectToUuidSchemaOptional,
    imovel: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const locacaoFindManyInputSchema = z.object({
  filter: locacaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const locacaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const locacaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const locacaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const locacaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const locacaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const locacaoCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  status: z.enum(locacaoEnumerators.status),
  dataInicio: dateOptionalSchema,
  dataFim: dateOptionalSchema,
  valorAluguel: numberSchema.pipe(z.number().min(0)),
  valorCondominio: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorIptuMensal: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  taxaAdministracaoPercentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  diaVencimento: numberOptionalSchema.pipe(
    z.int().min(1).max(31).nullable().optional(),
  ),
  indiceReajuste: z
    .enum(locacaoEnumerators.indiceReajuste)
    .nullable()
    .optional(),
  periodicidadeReajusteMeses: numberOptionalSchema.pipe(
    z.int().min(1).max(120).nullable().optional(),
  ),
  multaAtrasoPercentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  jurosMesPercentual: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  observacoes: z
    .string()
    .trim()
    .max(3500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  proposta: objectToUuidSchemaOptional,
  imovel: objectToUuidSchema,
  proprietario: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const locacaoImportInputSchema = locacaoCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const locacaoImportFileSchema = z
  .object({
    codigo: z.string(),
    status: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    valorAluguel: z.string(),
    valorCondominio: z.string(),
    valorIptuMensal: z.string(),
    taxaAdministracaoPercentual: z.string(),
    diaVencimento: z.string(),
    indiceReajuste: z.string(),
    periodicidadeReajusteMeses: z.string(),
    multaAtrasoPercentual: z.string(),
    jurosMesPercentual: z.string(),
    observacoes: z.string(),
    participantes: z.string().transform((val) => val.split(' ')),
    garantias: z.string().transform((val) => val.split(' ')),
    contratos: z.string().transform((val) => val.split(' ')),
    cobrancas: z.string().transform((val) => val.split(' ')),
    reajustes: z.string().transform((val) => val.split(' ')),
    repasses: z.string().transform((val) => val.split(' ')),
    comissoes: z.string().transform((val) => val.split(' ')),
    solicitacoesManutencao: z.string().transform((val) => val.split(' ')),
    despesas: z.string().transform((val) => val.split(' ')),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    seguros: z.string().transform((val) => val.split(' ')),
    ocorrencias: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
    proposta: z.string(),
    imovel: z.string(),
    proprietario: z.string(),
    corretor: z.string(),
  })
  .partial();

export const locacaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const locacaoUpdateBodyInputSchema = locacaoCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface LocacaoWithRelationships extends Locacao {
  participantes?: ParticipanteLocacao[];
  garantias?: GarantiaLocacao[];
  contratos?: ContratoLocacao[];
  cobrancas?: CobrancaLocacao[];
  reajustes?: ReajusteLocacao[];
  repasses?: RepasseProprietario[];
  comissoes?: Comissao[];
  solicitacoesManutencao?: SolicitacaoManutencao[];
  despesas?: DespesaImovel[];
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  seguros?: SeguroImovel[];
  ocorrencias?: OcorrenciaImovel[];
  filial?: Filial;
  proposta?: Proposta;
  imovel?: Imovel;
  proprietario?: Proprietario;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

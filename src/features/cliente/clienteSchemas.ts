import { Cliente } from '../../prisma/generated/client';
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
import { clienteEnumerators } from './clienteEnumerators';
import { Lead } from '../../prisma/generated/client';
import { TarefaComercial } from '../../prisma/generated/client';
import { Visita } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { ReservaImovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { ParticipanteLocacao } from '../../prisma/generated/client';
import { SolicitacaoManutencao } from '../../prisma/generated/client';
import { DocumentoPessoa } from '../../prisma/generated/client';
import { ConsentimentoLGPD } from '../../prisma/generated/client';
import { FavoritoCliente } from '../../prisma/generated/client';
import { SimulacaoFinanciamento } from '../../prisma/generated/client';
import { OcorrenciaImovel } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const clienteFindSchema = z.object({
  id: z.string(),
});

export const clienteFilterInputSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z.enum(clienteEnumerators.tipoPessoa).nullable().optional(),
    cpfCnpj: z.string(),
    dataNascimentoRange: z.array(dateOptionalSchema).max(2),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    profissao: z.string(),
    rendaMensalRange: z.array(numberOptionalSchema).max(2),
    finalidades: z.array(z.enum(clienteEnumerators.finalidades)),
    tiposInteresse: z.array(z.enum(clienteEnumerators.tiposInteresse)),
    faixaValorMinimoRange: z.array(numberOptionalSchema).max(2),
    faixaValorMaximoRange: z.array(numberOptionalSchema).max(2),
    cidadeInteresse: z.string(),
    bairrosInteresse: z.array(z.string()),
    canalPreferido: z
      .enum(clienteEnumerators.canalPreferido)
      .nullable()
      .optional(),
    ativo: booleanStringOptionalSchema,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const clienteFindManyInputSchema = z.object({
  filter: clienteFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const clienteDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const clienteArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const clienteRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const clienteAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nomeRazaoSocial: 'asc' }),
});

export const clienteAutocompleteOutputSchema = z.object({
  id: z.string(),
  nomeRazaoSocial: z.string(),
});

export const clienteCreateInputSchema = z.object({
  nomeRazaoSocial: z.string().trim().min(1).min(1).max(180),
  tipoPessoa: z.enum(clienteEnumerators.tipoPessoa),
  cpfCnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  dataNascimento: dateOptionalSchema,
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
  profissao: z
    .string()
    .trim()
    .max(120)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  rendaMensal: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  finalidades: z
    .array(z.enum(clienteEnumerators.finalidades))
    .max(6)
    .optional(),
  tiposInteresse: z
    .array(z.enum(clienteEnumerators.tiposInteresse))
    .max(11)
    .optional(),
  faixaValorMinimo: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  faixaValorMaximo: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  cidadeInteresse: z
    .string()
    .trim()
    .max(100)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  bairrosInteresse: z.array(z.string()).max(30).optional(),
  canalPreferido: z
    .enum(clienteEnumerators.canalPreferido)
    .nullable()
    .optional(),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .max(2500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const clienteImportInputSchema = clienteCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const clienteImportFileSchema = z
  .object({
    nomeRazaoSocial: z.string(),
    tipoPessoa: z.string(),
    cpfCnpj: z.string(),
    dataNascimento: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    profissao: z.string(),
    rendaMensal: z.string(),
    finalidades: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    tiposInteresse: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    faixaValorMinimo: z.string(),
    faixaValorMaximo: z.string(),
    cidadeInteresse: z.string(),
    bairrosInteresse: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    canalPreferido: z.string(),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    historicoLeads: z.string().transform((val) => val.split(' ')),
    tarefasRelacionadas: z.string().transform((val) => val.split(' ')),
    visitas: z.string().transform((val) => val.split(' ')),
    propostas: z.string().transform((val) => val.split(' ')),
    reservas: z.string().transform((val) => val.split(' ')),
    compras: z.string().transform((val) => val.split(' ')),
    participacoesLocacao: z.string().transform((val) => val.split(' ')),
    solicitacoesAbertas: z.string().transform((val) => val.split(' ')),
    documentosPessoais: z.string().transform((val) => val.split(' ')),
    consentimentos: z.string().transform((val) => val.split(' ')),
    favoritos: z.string().transform((val) => val.split(' ')),
    simulacoesFinanciamento: z.string().transform((val) => val.split(' ')),
    ocorrenciasReportadas: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
  })
  .partial();

export const clienteUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const clienteUpdateBodyInputSchema = clienteCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface ClienteWithRelationships extends Cliente {
  historicoLeads?: Lead[];
  tarefasRelacionadas?: TarefaComercial[];
  visitas?: Visita[];
  propostas?: Proposta[];
  reservas?: ReservaImovel[];
  compras?: Venda[];
  participacoesLocacao?: ParticipanteLocacao[];
  solicitacoesAbertas?: SolicitacaoManutencao[];
  documentosPessoais?: DocumentoPessoa[];
  consentimentos?: ConsentimentoLGPD[];
  favoritos?: FavoritoCliente[];
  simulacoesFinanciamento?: SimulacaoFinanciamento[];
  ocorrenciasReportadas?: OcorrenciaImovel[];
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

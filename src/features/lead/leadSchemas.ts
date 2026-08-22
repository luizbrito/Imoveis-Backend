import { Lead } from '../../prisma/generated/client';
import { z } from 'zod';
import { booleanStringOptionalSchema } from '../../shared/schemas/booleanStringSchema';
import { dateOptionalSchema } from '../../shared/schemas/dateSchema';
import {
  dateTimeOptionalSchema,
  dateTimeSchema,
} from '../../shared/schemas/dateTimeSchema';
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
import { leadEnumerators } from './leadEnumerators';
import { InteracaoLead } from '../../prisma/generated/client';
import { TarefaComercial } from '../../prisma/generated/client';
import { Visita } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { ConsentimentoLGPD } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';
import { Anuncio } from '../../prisma/generated/client';
import { CampanhaMarketing } from '../../prisma/generated/client';
import { PortalImobiliario } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';

export const leadFindSchema = z.object({
  id: z.string(),
});

export const leadFilterInputSchema = z
  .object({
    nome: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    origem: z.enum(leadEnumerators.origem).nullable().optional(),
    status: z.enum(leadEnumerators.status).nullable().optional(),
    temperatura: z.enum(leadEnumerators.temperatura).nullable().optional(),
    dataEntradaRange: z.array(dateTimeOptionalSchema).max(2),
    proximoContatoRange: z.array(dateTimeOptionalSchema).max(2),
    finalidade: z.enum(leadEnumerators.finalidade).nullable().optional(),
    faixaValorRange: z.array(numberOptionalSchema).max(2),
    motivoPerda: z.string(),
    filial: objectToUuidSchemaOptional,
    corretorResponsavel: objectToUuidSchemaOptional,
    anuncioOrigem: objectToUuidSchemaOptional,
    campanhaOrigem: objectToUuidSchemaOptional,
    portalOrigem: objectToUuidSchemaOptional,
    clienteConvertido: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const leadFindManyInputSchema = z.object({
  filter: leadFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const leadDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const leadArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const leadRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const leadAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nome: 'asc' }),
});

export const leadAutocompleteOutputSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const leadCreateInputSchema = z.object({
  nome: z.string().trim().min(1).min(1).max(180),
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
  origem: z.enum(leadEnumerators.origem),
  status: z.enum(leadEnumerators.status),
  temperatura: z.enum(leadEnumerators.temperatura),
  dataEntrada: dateTimeSchema,
  proximoContato: dateTimeOptionalSchema,
  finalidade: z.enum(leadEnumerators.finalidade).nullable().optional(),
  faixaValor: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  mensagemInicial: z
    .string()
    .trim()
    .max(3000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  motivoPerda: z
    .string()
    .trim()
    .max(500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  filial: objectToUuidSchema,
  corretorResponsavel: objectToUuidSchema,
  anuncioOrigem: objectToUuidSchemaOptional,
  campanhaOrigem: objectToUuidSchemaOptional,
  portalOrigem: objectToUuidSchemaOptional,
  clienteConvertido: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const leadImportInputSchema = leadCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const leadImportFileSchema = z
  .object({
    nome: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    origem: z.string(),
    status: z.string(),
    temperatura: z.string(),
    dataEntrada: z.string(),
    proximoContato: z.string(),
    finalidade: z.string(),
    faixaValor: z.string(),
    mensagemInicial: z.string(),
    motivoPerda: z.string(),
    interacoes: z.string().transform((val) => val.split(' ')),
    tarefas: z.string().transform((val) => val.split(' ')),
    visitas: z.string().transform((val) => val.split(' ')),
    propostas: z.string().transform((val) => val.split(' ')),
    consentimentos: z.string().transform((val) => val.split(' ')),
    filial: z.string(),
    corretorResponsavel: z.string(),
    anuncioOrigem: z.string(),
    campanhaOrigem: z.string(),
    portalOrigem: z.string(),
    clienteConvertido: z.string(),
  })
  .partial();

export const leadUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const leadUpdateBodyInputSchema = leadCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface LeadWithRelationships extends Lead {
  interacoes?: InteracaoLead[];
  tarefas?: TarefaComercial[];
  visitas?: Visita[];
  propostas?: Proposta[];
  consentimentos?: ConsentimentoLGPD[];
  filial?: Filial;
  corretorResponsavel?: Corretor;
  anuncioOrigem?: Anuncio;
  campanhaOrigem?: CampanhaMarketing;
  portalOrigem?: PortalImobiliario;
  clienteConvertido?: Cliente;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

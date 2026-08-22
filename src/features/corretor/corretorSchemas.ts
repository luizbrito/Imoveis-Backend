import { Corretor } from '../../prisma/generated/client';
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
import { corretorEnumerators } from './corretorEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { CaptacaoImovel } from '../../prisma/generated/client';
import { AvaliacaoImovel } from '../../prisma/generated/client';
import { Vistoria } from '../../prisma/generated/client';
import { Anuncio } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { InteracaoLead } from '../../prisma/generated/client';
import { TarefaComercial } from '../../prisma/generated/client';
import { Visita } from '../../prisma/generated/client';
import { Proposta } from '../../prisma/generated/client';
import { ReservaImovel } from '../../prisma/generated/client';
import { Venda } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { Comissao } from '../../prisma/generated/client';
import { SolicitacaoManutencao } from '../../prisma/generated/client';
import { DocumentoPessoa } from '../../prisma/generated/client';
import { SolicitacaoContato } from '../../prisma/generated/client';
import { OcorrenciaImovel } from '../../prisma/generated/client';
import { Filial } from '../../prisma/generated/client';

export const corretorFindSchema = z.object({
  id: z.string(),
});

export const corretorFilterInputSchema = z
  .object({
    nomeCompleto: z.string(),
    tipoPessoa: z.enum(corretorEnumerators.tipoPessoa).nullable().optional(),
    cpfCnpj: z.string(),
    creci: z.string(),
    ufCreci: z.enum(corretorEnumerators.ufCreci).nullable().optional(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    percentualComissaoPadraoRange: z.array(numberOptionalSchema).max(2),
    especialidades: z.array(z.enum(corretorEnumerators.especialidades)),
    ativo: booleanStringOptionalSchema,
    contaMembro: objectToUuidSchemaOptional,
    filial: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const corretorFindManyInputSchema = z.object({
  filter: corretorFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const corretorDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const corretorArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const corretorRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const corretorAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ nomeCompleto: 'asc' }),
});

export const corretorAutocompleteOutputSchema = z.object({
  id: z.string(),
  nomeCompleto: z.string(),
});

export const corretorCreateInputSchema = z.object({
  nomeCompleto: z.string().trim().min(1).min(1).max(180),
  tipoPessoa: z.enum(corretorEnumerators.tipoPessoa),
  cpfCnpj: z
    .string()
    .trim()
    .max(20)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  creci: z.string().trim().min(1).max(40),
  ufCreci: z.enum(corretorEnumerators.ufCreci).nullable().optional(),
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
  percentualComissaoPadrao: numberOptionalSchema.pipe(
    z.number().min(0).max(100).nullable().optional(),
  ),
  especialidades: z
    .array(z.enum(corretorEnumerators.especialidades))
    .max(8)
    .optional(),
  foto: z.array(fileUploadedSchema).max(1).optional(),
  ativo: z.boolean().default(false),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  contaMembro: objectToUuidSchemaOptional,
  filial: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const corretorImportInputSchema = corretorCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    foto: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const corretorImportFileSchema = z
  .object({
    nomeCompleto: z.string(),
    tipoPessoa: z.string(),
    cpfCnpj: z.string(),
    creci: z.string(),
    ufCreci: z.string(),
    telefone: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    percentualComissaoPadrao: z.string(),
    especialidades: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    foto: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    ativo: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    observacoes: z.string(),
    imoveisCaptados: z.string().transform((val) => val.split(' ')),
    captacoes: z.string().transform((val) => val.split(' ')),
    avaliacoesRealizadas: z.string().transform((val) => val.split(' ')),
    vistoriasResponsaveis: z.string().transform((val) => val.split(' ')),
    anunciosResponsaveis: z.string().transform((val) => val.split(' ')),
    leadsResponsaveis: z.string().transform((val) => val.split(' ')),
    interacoesRealizadas: z.string().transform((val) => val.split(' ')),
    tarefasAtribuidas: z.string().transform((val) => val.split(' ')),
    visitasConduzidas: z.string().transform((val) => val.split(' ')),
    propostasIntermediadas: z.string().transform((val) => val.split(' ')),
    reservasGerenciadas: z.string().transform((val) => val.split(' ')),
    vendasIntermediadas: z.string().transform((val) => val.split(' ')),
    locacoesIntermediadas: z.string().transform((val) => val.split(' ')),
    comissoes: z.string().transform((val) => val.split(' ')),
    solicitacoesGerenciadas: z.string().transform((val) => val.split(' ')),
    documentosPessoais: z.string().transform((val) => val.split(' ')),
    solicitacoesAtendidas: z.string().transform((val) => val.split(' ')),
    ocorrenciasGerenciadas: z.string().transform((val) => val.split(' ')),
    contaMembro: z.string(),
    filial: z.string(),
  })
  .partial();

export const corretorUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const corretorUpdateBodyInputSchema = corretorCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface CorretorWithRelationships extends Corretor {
  imoveisCaptados?: Imovel[];
  captacoes?: CaptacaoImovel[];
  avaliacoesRealizadas?: AvaliacaoImovel[];
  vistoriasResponsaveis?: Vistoria[];
  anunciosResponsaveis?: Anuncio[];
  leadsResponsaveis?: Lead[];
  interacoesRealizadas?: InteracaoLead[];
  tarefasAtribuidas?: TarefaComercial[];
  visitasConduzidas?: Visita[];
  propostasIntermediadas?: Proposta[];
  reservasGerenciadas?: ReservaImovel[];
  vendasIntermediadas?: Venda[];
  locacoesIntermediadas?: Locacao[];
  comissoes?: Comissao[];
  solicitacoesGerenciadas?: SolicitacaoManutencao[];
  documentosPessoais?: DocumentoPessoa[];
  solicitacoesAtendidas?: SolicitacaoContato[];
  ocorrenciasGerenciadas?: OcorrenciaImovel[];
  contaMembro?: MemberWithRelationships;
  filial?: Filial;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

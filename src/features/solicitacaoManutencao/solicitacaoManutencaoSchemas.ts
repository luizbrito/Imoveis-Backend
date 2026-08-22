import { SolicitacaoManutencao } from '../../prisma/generated/client';
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
import { fileUploadedSchema } from '../file/fileSchemas';
import { MemberWithRelationships } from '../member/memberSchemas';
import { solicitacaoManutencaoEnumerators } from './solicitacaoManutencaoEnumerators';
import { OrdemServico } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { Cliente } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const solicitacaoManutencaoFindSchema = z.object({
  id: z.string(),
});

export const solicitacaoManutencaoFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataAberturaRange: z.array(dateTimeOptionalSchema).max(2),
    origem: z
      .enum(solicitacaoManutencaoEnumerators.origem)
      .nullable()
      .optional(),
    categoria: z
      .enum(solicitacaoManutencaoEnumerators.categoria)
      .nullable()
      .optional(),
    prioridade: z
      .enum(solicitacaoManutencaoEnumerators.prioridade)
      .nullable()
      .optional(),
    status: z
      .enum(solicitacaoManutencaoEnumerators.status)
      .nullable()
      .optional(),
    titulo: z.string(),
    responsabilidadeCusto: z
      .enum(solicitacaoManutencaoEnumerators.responsabilidadeCusto)
      .nullable()
      .optional(),
    valorLimiteAutorizadoRange: z.array(numberOptionalSchema).max(2),
    dataConclusaoRange: z.array(dateTimeOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    locacao: objectToUuidSchemaOptional,
    clienteSolicitante: objectToUuidSchemaOptional,
    corretorResponsavel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const solicitacaoManutencaoFindManyInputSchema = z.object({
  filter: solicitacaoManutencaoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const solicitacaoManutencaoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoManutencaoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoManutencaoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const solicitacaoManutencaoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const solicitacaoManutencaoAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const solicitacaoManutencaoCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataAbertura: dateTimeSchema,
  origem: z.enum(solicitacaoManutencaoEnumerators.origem),
  categoria: z.enum(solicitacaoManutencaoEnumerators.categoria),
  prioridade: z.enum(solicitacaoManutencaoEnumerators.prioridade),
  status: z.enum(solicitacaoManutencaoEnumerators.status),
  titulo: z.string().trim().min(1).max(180),
  descricao: z.string().trim().min(1).max(4000),
  imagens: z.array(fileUploadedSchema).max(20).optional(),
  responsabilidadeCusto: z
    .enum(solicitacaoManutencaoEnumerators.responsabilidadeCusto)
    .nullable()
    .optional(),
  valorLimiteAutorizado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  dataConclusao: dateTimeOptionalSchema,
  imovel: objectToUuidSchema,
  locacao: objectToUuidSchemaOptional,
  clienteSolicitante: objectToUuidSchemaOptional,
  corretorResponsavel: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const solicitacaoManutencaoImportInputSchema =
  solicitacaoManutencaoCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      imagens: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const solicitacaoManutencaoImportFileSchema = z
  .object({
    codigo: z.string(),
    dataAbertura: z.string(),
    origem: z.string(),
    categoria: z.string(),
    prioridade: z.string(),
    status: z.string(),
    titulo: z.string(),
    descricao: z.string(),
    imagens: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    responsabilidadeCusto: z.string(),
    valorLimiteAutorizado: z.string(),
    dataConclusao: z.string(),
    ordensServico: z.string().transform((val) => val.split(' ')),
    imovel: z.string(),
    locacao: z.string(),
    clienteSolicitante: z.string(),
    corretorResponsavel: z.string(),
  })
  .partial();

export const solicitacaoManutencaoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const solicitacaoManutencaoUpdateBodyInputSchema =
  solicitacaoManutencaoCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface SolicitacaoManutencaoWithRelationships extends SolicitacaoManutencao {
  ordensServico?: OrdemServico[];
  imovel?: Imovel;
  locacao?: Locacao;
  clienteSolicitante?: Cliente;
  corretorResponsavel?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

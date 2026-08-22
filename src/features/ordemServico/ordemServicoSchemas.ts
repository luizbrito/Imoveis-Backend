import { OrdemServico } from '../../prisma/generated/client';
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
import { ordemServicoEnumerators } from './ordemServicoEnumerators';
import { DespesaImovel } from '../../prisma/generated/client';
import { SolicitacaoManutencao } from '../../prisma/generated/client';
import { Fornecedor } from '../../prisma/generated/client';

export const ordemServicoFindSchema = z.object({
  id: z.string(),
});

export const ordemServicoFilterInputSchema = z
  .object({
    codigo: z.string(),
    status: z.enum(ordemServicoEnumerators.status).nullable().optional(),
    dataEmissaoRange: z.array(dateOptionalSchema).max(2),
    dataAgendadaRange: z.array(dateTimeOptionalSchema).max(2),
    dataConclusaoRange: z.array(dateTimeOptionalSchema).max(2),
    valorOrcadoRange: z.array(numberOptionalSchema).max(2),
    valorAprovadoRange: z.array(numberOptionalSchema).max(2),
    valorFinalRange: z.array(numberOptionalSchema).max(2),
    avaliacaoServicoRange: z.array(numberOptionalSchema).max(2),
    solicitacao: objectToUuidSchemaOptional,
    fornecedor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const ordemServicoFindManyInputSchema = z.object({
  filter: ordemServicoFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const ordemServicoDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ordemServicoArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ordemServicoRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ordemServicoAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const ordemServicoAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const ordemServicoCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  status: z.enum(ordemServicoEnumerators.status),
  dataEmissao: dateSchema,
  dataAgendada: dateTimeOptionalSchema,
  dataConclusao: dateTimeOptionalSchema,
  descricaoServico: z.string().trim().min(1).max(3500),
  valorOrcado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorAprovado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorFinal: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  documentos: z.array(fileUploadedSchema).max(15).optional(),
  fotosAntes: z.array(fileUploadedSchema).max(20).optional(),
  fotosDepois: z.array(fileUploadedSchema).max(20).optional(),
  avaliacaoServico: numberOptionalSchema.pipe(
    z.number().min(0).max(5).nullable().optional(),
  ),
  solicitacao: objectToUuidSchema,
  fornecedor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const ordemServicoImportInputSchema = ordemServicoCreateInputSchema
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
    fotosAntes: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
    fotosDepois: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const ordemServicoImportFileSchema = z
  .object({
    codigo: z.string(),
    status: z.string(),
    dataEmissao: z.string(),
    dataAgendada: z.string(),
    dataConclusao: z.string(),
    descricaoServico: z.string(),
    valorOrcado: z.string(),
    valorAprovado: z.string(),
    valorFinal: z.string(),
    documentos: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    fotosAntes: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    fotosDepois: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    avaliacaoServico: z.string(),
    despesas: z.string().transform((val) => val.split(' ')),
    solicitacao: z.string(),
    fornecedor: z.string(),
  })
  .partial();

export const ordemServicoUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const ordemServicoUpdateBodyInputSchema = ordemServicoCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface OrdemServicoWithRelationships extends OrdemServico {
  despesas?: DespesaImovel[];
  solicitacao?: SolicitacaoManutencao;
  fornecedor?: Fornecedor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

import { AvaliacaoImovel } from '../../prisma/generated/client';
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
import { avaliacaoImovelEnumerators } from './avaliacaoImovelEnumerators';
import { Imovel } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const avaliacaoImovelFindSchema = z.object({
  id: z.string(),
});

export const avaliacaoImovelFilterInputSchema = z
  .object({
    codigo: z.string(),
    dataAvaliacaoRange: z.array(dateOptionalSchema).max(2),
    metodo: z.enum(avaliacaoImovelEnumerators.metodo).nullable().optional(),
    valorMercadoRange: z.array(numberOptionalSchema).max(2),
    valorVendaRapidaRange: z.array(numberOptionalSchema).max(2),
    valorLocacaoEstimadoRange: z.array(numberOptionalSchema).max(2),
    moeda: z.enum(avaliacaoImovelEnumerators.moeda).nullable().optional(),
    validadeAteRange: z.array(dateOptionalSchema).max(2),
    imovel: objectToUuidSchemaOptional,
    avaliador: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const avaliacaoImovelFindManyInputSchema = z.object({
  filter: avaliacaoImovelFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const avaliacaoImovelDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const avaliacaoImovelArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const avaliacaoImovelRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const avaliacaoImovelAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ codigo: 'asc' }),
});

export const avaliacaoImovelAutocompleteOutputSchema = z.object({
  id: z.string(),
  codigo: z.string(),
});

export const avaliacaoImovelCreateInputSchema = z.object({
  codigo: z.string().trim().min(1).min(1).max(40),
  dataAvaliacao: dateSchema,
  metodo: z.enum(avaliacaoImovelEnumerators.metodo),
  valorMercado: numberSchema.pipe(z.number().min(0)),
  valorVendaRapida: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorLocacaoEstimado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  moeda: z.enum(avaliacaoImovelEnumerators.moeda),
  validadeAte: dateOptionalSchema,
  laudo: z.array(fileUploadedSchema).max(5).optional(),
  criterios: z
    .string()
    .trim()
    .max(5000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  avaliador: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const avaliacaoImovelImportInputSchema = avaliacaoImovelCreateInputSchema
  .extend(importerInputSchema.shape)
  .extend({
    laudo: z
      .union([z.array(fileUploadedSchema), z.array(z.string())])
      .transform((val) => {
        if (val.length > 0 && typeof val[0] === 'string') {
          return val;
        }
        return val;
      }),
  });

export const avaliacaoImovelImportFileSchema = z
  .object({
    codigo: z.string(),
    dataAvaliacao: z.string(),
    metodo: z.string(),
    valorMercado: z.string(),
    valorVendaRapida: z.string(),
    valorLocacaoEstimado: z.string(),
    moeda: z.string(),
    validadeAte: z.string(),
    laudo: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    criterios: z.string(),
    imovel: z.string(),
    avaliador: z.string(),
  })
  .partial();

export const avaliacaoImovelUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const avaliacaoImovelUpdateBodyInputSchema =
  avaliacaoImovelCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface AvaliacaoImovelWithRelationships extends AvaliacaoImovel {
  imovel?: Imovel;
  avaliador?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

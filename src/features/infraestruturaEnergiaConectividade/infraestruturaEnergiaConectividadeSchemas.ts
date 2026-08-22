import { InfraestruturaEnergiaConectividade } from '../../prisma/generated/client';
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
import { infraestruturaEnergiaConectividadeEnumerators } from './infraestruturaEnergiaConectividadeEnumerators';
import { Imovel } from '../../prisma/generated/client';

export const infraestruturaEnergiaConectividadeFindSchema = z.object({
  id: z.string(),
});

export const infraestruturaEnergiaConectividadeFilterInputSchema = z
  .object({
    descricao: z.string(),
    energiaDisponivel: booleanStringOptionalSchema,
    tipoRede: z
      .enum(infraestruturaEnergiaConectividadeEnumerators.tipoRede)
      .nullable()
      .optional(),
    potenciaInstaladaKvaRange: z.array(numberOptionalSchema).max(2),
    quantidadeTransformadoresRange: z.array(numberOptionalSchema).max(2),
    gerador: booleanStringOptionalSchema,
    energiaSolar: booleanStringOptionalSchema,
    potenciaSolarKwRange: z.array(numberOptionalSchema).max(2),
    distanciaRedeEnergiaKmRange: z.array(numberOptionalSchema).max(2),
    internetFibra: booleanStringOptionalSchema,
    internetRadio: booleanStringOptionalSchema,
    starlink: booleanStringOptionalSchema,
    sinalCelular: z
      .enum(infraestruturaEnergiaConectividadeEnumerators.sinalCelular)
      .nullable()
      .optional(),
    imovel: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const infraestruturaEnergiaConectividadeFindManyInputSchema = z.object({
  filter: infraestruturaEnergiaConectividadeFilterInputSchema
    .partial()
    .optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const infraestruturaEnergiaConectividadeDeleteManyInputSchema = z.object(
  {
    ids: z.array(z.string()),
  },
);

export const infraestruturaEnergiaConectividadeArchiveManyInputSchema =
  z.object({
    ids: z.array(z.string()),
  });

export const infraestruturaEnergiaConectividadeRestoreManyInputSchema =
  z.object({
    ids: z.array(z.string()),
  });

export const infraestruturaEnergiaConectividadeAutocompleteInputSchema =
  z.object({
    search: z.string().trim().optional(),
    exclude: z.array(z.uuid()).optional(),
    take: z.coerce.number().optional(),
    orderBy: orderBySchema.default({ descricao: 'asc' }),
  });

export const infraestruturaEnergiaConectividadeAutocompleteOutputSchema =
  z.object({
    id: z.string(),
    descricao: z.string(),
  });

export const infraestruturaEnergiaConectividadeCreateInputSchema = z.object({
  descricao: z.string().trim().min(1).min(1).max(250),
  energiaDisponivel: z.boolean().default(false),
  tipoRede: z
    .enum(infraestruturaEnergiaConectividadeEnumerators.tipoRede)
    .nullable()
    .optional(),
  potenciaInstaladaKva: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  quantidadeTransformadores: numberOptionalSchema.pipe(
    z.int().nullable().optional(),
  ),
  gerador: z.boolean().default(false),
  energiaSolar: z.boolean().default(false),
  potenciaSolarKw: numberOptionalSchema.pipe(z.number().nullable().optional()),
  distanciaRedeEnergiaKm: numberOptionalSchema.pipe(
    z.number().nullable().optional(),
  ),
  internetFibra: z.boolean().default(false),
  internetRadio: z.boolean().default(false),
  starlink: z.boolean().default(false),
  sinalCelular: z
    .enum(infraestruturaEnergiaConectividadeEnumerators.sinalCelular)
    .nullable()
    .optional(),
  operadorasDisponiveis: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  observacoes: z
    .string()
    .trim()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  imovel: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const infraestruturaEnergiaConectividadeImportInputSchema =
  infraestruturaEnergiaConectividadeCreateInputSchema.extend(
    importerInputSchema.shape,
  );

export const infraestruturaEnergiaConectividadeImportFileSchema = z
  .object({
    descricao: z.string(),
    energiaDisponivel: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    tipoRede: z.string(),
    potenciaInstaladaKva: z.string(),
    quantidadeTransformadores: z.string(),
    gerador: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    energiaSolar: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    potenciaSolarKw: z.string(),
    distanciaRedeEnergiaKm: z.string(),
    internetFibra: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    internetRadio: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    starlink: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    sinalCelular: z.string(),
    operadorasDisponiveis: z.string(),
    observacoes: z.string(),
    imovel: z.string(),
  })
  .partial();

export const infraestruturaEnergiaConectividadeUpdateParamsInputSchema =
  z.object({
    id: z.string(),
  });

export const infraestruturaEnergiaConectividadeUpdateBodyInputSchema =
  infraestruturaEnergiaConectividadeCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface InfraestruturaEnergiaConectividadeWithRelationships extends InfraestruturaEnergiaConectividade {
  imovel?: Imovel;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

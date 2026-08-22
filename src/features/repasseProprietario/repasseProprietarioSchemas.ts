import { RepasseProprietario } from '../../prisma/generated/client';
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
import { repasseProprietarioEnumerators } from './repasseProprietarioEnumerators';
import { LancamentoFinanceiro } from '../../prisma/generated/client';
import { Locacao } from '../../prisma/generated/client';
import { Proprietario } from '../../prisma/generated/client';

export const repasseProprietarioFindSchema = z.object({
  id: z.string(),
});

export const repasseProprietarioFilterInputSchema = z
  .object({
    competencia: z.string(),
    dataPrevistaRange: z.array(dateOptionalSchema).max(2),
    dataRepasseRange: z.array(dateOptionalSchema).max(2),
    status: z.enum(repasseProprietarioEnumerators.status).nullable().optional(),
    valorRecebidoRange: z.array(numberOptionalSchema).max(2),
    taxaAdministracaoRange: z.array(numberOptionalSchema).max(2),
    despesasDescontadasRange: z.array(numberOptionalSchema).max(2),
    impostosRetidosRange: z.array(numberOptionalSchema).max(2),
    valorLiquidoRange: z.array(numberOptionalSchema).max(2),
    locacao: objectToUuidSchemaOptional,
    proprietario: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const repasseProprietarioFindManyInputSchema = z.object({
  filter: repasseProprietarioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const repasseProprietarioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const repasseProprietarioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const repasseProprietarioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const repasseProprietarioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ competencia: 'asc' }),
});

export const repasseProprietarioAutocompleteOutputSchema = z.object({
  id: z.string(),
  competencia: z.string(),
});

export const repasseProprietarioCreateInputSchema = z.object({
  competencia: z.string().trim().min(1).min(1).max(7),
  dataPrevista: dateOptionalSchema,
  dataRepasse: dateOptionalSchema,
  status: z.enum(repasseProprietarioEnumerators.status),
  valorRecebido: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  taxaAdministracao: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  despesasDescontadas: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  impostosRetidos: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  valorLiquido: numberSchema.pipe(z.number().min(0)),
  comprovante: z.array(fileUploadedSchema).max(5).optional(),
  observacoes: z
    .string()
    .trim()
    .max(1500)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  locacao: objectToUuidSchema,
  proprietario: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const repasseProprietarioImportInputSchema =
  repasseProprietarioCreateInputSchema
    .extend(importerInputSchema.shape)
    .extend({
      comprovante: z
        .union([z.array(fileUploadedSchema), z.array(z.string())])
        .transform((val) => {
          if (val.length > 0 && typeof val[0] === 'string') {
            return val;
          }
          return val;
        }),
    });

export const repasseProprietarioImportFileSchema = z
  .object({
    competencia: z.string(),
    dataPrevista: z.string(),
    dataRepasse: z.string(),
    status: z.string(),
    valorRecebido: z.string(),
    taxaAdministracao: z.string(),
    despesasDescontadas: z.string(),
    impostosRetidos: z.string(),
    valorLiquido: z.string(),
    comprovante: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    observacoes: z.string(),
    lancamentosFinanceiros: z.string().transform((val) => val.split(' ')),
    locacao: z.string(),
    proprietario: z.string(),
  })
  .partial();

export const repasseProprietarioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const repasseProprietarioUpdateBodyInputSchema =
  repasseProprietarioCreateInputSchema.partial().extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface RepasseProprietarioWithRelationships extends RepasseProprietario {
  lancamentosFinanceiros?: LancamentoFinanceiro[];
  locacao?: Locacao;
  proprietario?: Proprietario;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

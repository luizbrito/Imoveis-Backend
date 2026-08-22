import { Anuncio } from '../../prisma/generated/client';
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
import { anuncioEnumerators } from './anuncioEnumerators';
import { PublicacaoPortal } from '../../prisma/generated/client';
import { CampanhaAnuncio } from '../../prisma/generated/client';
import { Lead } from '../../prisma/generated/client';
import { SolicitacaoContato } from '../../prisma/generated/client';
import { Imovel } from '../../prisma/generated/client';
import { Corretor } from '../../prisma/generated/client';

export const anuncioFindSchema = z.object({
  id: z.string(),
});

export const anuncioFilterInputSchema = z
  .object({
    titulo: z.string(),
    slug: z.string(),
    status: z.enum(anuncioEnumerators.status).nullable().optional(),
    dataInicioRange: z.array(dateTimeOptionalSchema).max(2),
    dataFimRange: z.array(dateTimeOptionalSchema).max(2),
    valorDivulgadoRange: z.array(numberOptionalSchema).max(2),
    tituloSeo: z.string(),
    palavrasChave: z.array(z.string()),
    destaque: booleanStringOptionalSchema,
    aceitaContato: booleanStringOptionalSchema,
    imovel: objectToUuidSchemaOptional,
    corretor: objectToUuidSchemaOptional,
    createdByMember: objectToUuidSchemaOptional,
    updatedByMember: objectToUuidSchemaOptional,
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    updatedAtRange: z.array(dateTimeOptionalSchema).max(2),
    archived: booleanStringOptionalSchema,
  })
  .partial();

export const anuncioFindManyInputSchema = z.object({
  filter: anuncioFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const anuncioDeleteManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const anuncioArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const anuncioRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const anuncioAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ titulo: 'asc' }),
});

export const anuncioAutocompleteOutputSchema = z.object({
  id: z.string(),
  titulo: z.string(),
});

export const anuncioCreateInputSchema = z.object({
  titulo: z.string().trim().min(1).min(1).max(180),
  slug: z
    .string()
    .trim()
    .max(180)
    .toLowerCase()
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  status: z.enum(anuncioEnumerators.status),
  dataInicio: dateTimeOptionalSchema,
  dataFim: dateTimeOptionalSchema,
  valorDivulgado: numberOptionalSchema.pipe(
    z.number().min(0).nullable().optional(),
  ),
  tituloSeo: z
    .string()
    .trim()
    .max(160)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  descricaoSeo: z
    .string()
    .trim()
    .max(320)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  palavrasChave: z.array(z.string()).max(30).optional(),
  textoPublicacao: z
    .string()
    .trim()
    .max(8000)
    .or(z.string().trim().max(0))
    .nullable()
    .optional(),
  destaque: z.boolean().default(false),
  aceitaContato: z.boolean().default(false),
  imovel: objectToUuidSchema,
  corretor: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const anuncioImportInputSchema = anuncioCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const anuncioImportFileSchema = z
  .object({
    titulo: z.string(),
    slug: z.string(),
    status: z.string(),
    dataInicio: z.string(),
    dataFim: z.string(),
    valorDivulgado: z.string(),
    tituloSeo: z.string(),
    descricaoSeo: z.string(),
    palavrasChave: z
      .string()
      .transform((val) => val?.split(' ')?.filter(Boolean) || []),
    textoPublicacao: z.string(),
    destaque: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    aceitaContato: z
      .string()
      .transform((val) => val === 'true' || val === 'TRUE'),
    publicacoesPortais: z.string().transform((val) => val.split(' ')),
    campanhasVinculadas: z.string().transform((val) => val.split(' ')),
    leadsGerados: z.string().transform((val) => val.split(' ')),
    solicitacoesContato: z.string().transform((val) => val.split(' ')),
    imovel: z.string(),
    corretor: z.string(),
  })
  .partial();

export const anuncioUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const anuncioUpdateBodyInputSchema = anuncioCreateInputSchema
  .partial()
  .extend({
    updatedAt: dateTimeOptionalSchema,
  });

export interface AnuncioWithRelationships extends Anuncio {
  publicacoesPortais?: PublicacaoPortal[];
  campanhasVinculadas?: CampanhaAnuncio[];
  leadsGerados?: Lead[];
  solicitacoesContato?: SolicitacaoContato[];
  imovel?: Imovel;
  corretor?: Corretor;
  createdByMember?: MemberWithRelationships;
  updatedByMember?: MemberWithRelationships;
  archivedByMember?: MemberWithRelationships;
}

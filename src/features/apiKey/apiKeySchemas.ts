import { z } from 'zod';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { orderBySchema } from '../../shared/schemas/orderBySchema';

export const apiKeyFindSchema = z.object({
  id: z.string(),
});

export const apiKeyCreateInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  expiresAt: dateTimeOptionalSchema,
  permissions: z.array(z.string()).optional(),
});

export const apiKeyCreateBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  expiresInSeconds: z.number().int().positive().optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
});

export const apiKeyUpdateInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
  enabled: z.boolean(),
});

export const apiKeyUpdateBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  enabled: z.boolean(),
});

export const apiKeyFilterInputSchema = z
  .object({
    name: z.string(),
  })
  .partial();

export const apiKeyFindManyInputSchema = z.object({
  filter: apiKeyFilterInputSchema.optional(),
  orderBy: orderBySchema.optional().default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

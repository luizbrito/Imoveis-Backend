import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { z } from 'zod';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { objectToUuidSchemaOptional } from '../../shared/schemas/objectToUuidSchema';
import { orderBySchema } from '../../shared/schemas/orderBySchema';
import { dictionary } from '../../translation/en/en';
import { auditLogOperations } from './auditLogOperations';
import { ApiKey, AuditLog } from '../../prisma/generated/client';
import { FileUploaded } from '../file/fileSchemas';

dayjs.extend(utc);
dayjs.extend(timezone);

function isValidTimezone(tz: string) {
  try {
    dayjs().tz(tz);
    return true;
  } catch (e) {
    return false;
  }
}

export const auditLogActivityChartInputSchema = z.object({
  timezone: z.string().refine(isValidTimezone, {
    error: dictionary.shared.errors.timezone,
  }),
});

export const auditLogActivityChartOutputSchema = z.array(
  z.object({
    timestamp: z.iso.datetime(),
    count: z.number(),
  }),
);

export const auditLogFilterInputSchema = z
  .object({
    entityNames: z.array(z.string().trim()),
    entityId: z.string().optional(),
    apiHttpResponseCode: z.string().trim(),
    apiEndpoint: z.string().trim(),
    operations: z.array(z.enum(auditLogOperations)),
    timestampRange: z.array(dateTimeOptionalSchema).max(2),
    apiKey: objectToUuidSchemaOptional,
    member: objectToUuidSchemaOptional,
  })
  .partial();

export const auditLogFindManyInputSchema = z.object({
  filter: auditLogFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ timestamp: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export interface AuditLogWithAuthor extends AuditLog {
  apiKey: Partial<ApiKey>;
  authorEmail?: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatars?: FileUploaded[];
}

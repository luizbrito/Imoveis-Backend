import { isString } from 'lodash-es';
import { z } from 'zod';

export const objectToUuidSchema = z
  .union([
    z.string().nullable().optional(),
    z.object({ id: z.string().nullable().optional() }),
  ])
  .transform((rel) => (isString(rel) ? rel : rel?.id))
  .pipe(z.uuid());

export const objectToUuidSchemaOptional = z
  .union([z.uuid(), z.object({ id: z.uuid() })])
  .optional()
  .nullable()
  .transform((rel) =>
    rel !== undefined ? (isString(rel) ? rel : rel?.id || null) : undefined,
  );

import { z } from 'zod';

export const numberSchema = z
  .union([z.string().min(1), z.number()])
  .transform((x) => Number(x));

export const numberOptionalSchema = z
  .union([z.string().optional().nullable(), z.number().optional().nullable()])
  .transform((x) => {
    const parsed =
      x === null || x === '' ? null : x === undefined ? undefined : Number(x);

    return parsed;
  });

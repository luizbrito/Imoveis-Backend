import dayjs from 'dayjs';
import { z } from 'zod';

export const dateSchema = z
  .string()
  .min(1)
  .refine((val) => dayjs(val).isValid());

export const dateOptionalSchema = z
  .string()
  .nullable()
  .transform((val) => (val === '' ? null : val))
  .refine((val) => !val || dayjs(val).isValid())
  .nullable()
  .optional();

import { z } from 'zod';

export const booleanStringSchema = z.enum(['true', 'false']).optional();

export const booleanStringOptionalSchema = z
  .enum(['true', 'false', ''])
  .optional();

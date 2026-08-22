import { z } from 'zod';

// Uses io:"input" to show wire format before transforms (e.g., z.coerce converts "123" string to number)
// Uses unrepresentable:"any" to gracefully handle types that can't be represented in JSON Schema
export function toMcpJsonSchema(schema: z.ZodTypeAny): any {
  return z.toJSONSchema(schema, {
    io: 'input',
    unrepresentable: 'any',
  });
}

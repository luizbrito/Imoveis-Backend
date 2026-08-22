import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pistaAviacaoRuralImportInputSchema } from '../pistaAviacaoRuralSchemas';
import { pistaAviacaoRuralCreate } from './pistaAviacaoRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pista-aviacao-rural/importer',
  body: z.array(pistaAviacaoRuralImportInputSchema),
  response: importerOutputSchema,
};

export const pistaAviacaoRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_import',
  description:
    dictionary.pistaAviacaoRural.importer?.title ||
    'Import pistasAviacaoRurais',
  requiredPermissions: { pistaAviacaoRural: ['import'] },
  schema: toMcpJsonSchema(z.array(pistaAviacaoRuralImportInputSchema)),
  handler: async (params, context) => {
    return await pistaAviacaoRuralImporterController(params, context);
  },
});

export async function pistaAviacaoRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = pistaAviacaoRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.pistaAviacaoRural.count({
              where: {
                importHash: data.importHash,
                organizationId: currentOrganization.id,
              },
            }),
          );
        },
      );

      if (isImportHashExistent) {
        throw new Error400(
          context.dictionary.shared.importer.importHashAlreadyExists,
        );
      }

      await pistaAviacaoRuralCreate(row, context);

      output.push({
        _status: 'success',
        _line: (row as any)._line,
      });
    } catch (error: any) {
      output.push({
        _status: 'error',
        _line: (row as any)._line,
        _errorMessages: [error.message],
      });
    }
  }

  return output;
}

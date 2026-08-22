import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { logisticaRuralImportInputSchema } from '../logisticaRuralSchemas';
import { logisticaRuralCreate } from './logisticaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/logistica-rural/importer',
  body: z.array(logisticaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const logisticaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_import',
  description:
    dictionary.logisticaRural.importer?.title || 'Import logisticasRurais',
  requiredPermissions: { logisticaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(logisticaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await logisticaRuralImporterController(params, context);
  },
});

export async function logisticaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = logisticaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.logisticaRural.count({
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

      await logisticaRuralCreate(row, context);

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

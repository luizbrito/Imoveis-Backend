import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { topografiaRuralImportInputSchema } from '../topografiaRuralSchemas';
import { topografiaRuralCreate } from './topografiaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/topografia-rural/importer',
  body: z.array(topografiaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const topografiaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_import',
  description:
    dictionary.topografiaRural.importer?.title || 'Import topografiasRurais',
  requiredPermissions: { topografiaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(topografiaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await topografiaRuralImporterController(params, context);
  },
});

export async function topografiaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = topografiaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.topografiaRural.count({
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

      await topografiaRuralCreate(row, context);

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

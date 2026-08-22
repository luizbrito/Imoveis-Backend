import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { benfeitoriaRuralImportInputSchema } from '../benfeitoriaRuralSchemas';
import { benfeitoriaRuralCreate } from './benfeitoriaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/benfeitoria-rural/importer',
  body: z.array(benfeitoriaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const benfeitoriaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_import',
  description:
    dictionary.benfeitoriaRural.importer?.title || 'Import benfeitoriasRurais',
  requiredPermissions: { benfeitoriaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(benfeitoriaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await benfeitoriaRuralImporterController(params, context);
  },
});

export async function benfeitoriaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = benfeitoriaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.benfeitoriaRural.count({
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

      await benfeitoriaRuralCreate(row, context);

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

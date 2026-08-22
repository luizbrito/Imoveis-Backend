import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { recursoHidricoRuralImportInputSchema } from '../recursoHidricoRuralSchemas';
import { recursoHidricoRuralCreate } from './recursoHidricoRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/recurso-hidrico-rural/importer',
  body: z.array(recursoHidricoRuralImportInputSchema),
  response: importerOutputSchema,
};

export const recursoHidricoRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_import',
  description:
    dictionary.recursoHidricoRural.importer?.title ||
    'Import recursosHidricosRurais',
  requiredPermissions: { recursoHidricoRural: ['import'] },
  schema: toMcpJsonSchema(z.array(recursoHidricoRuralImportInputSchema)),
  handler: async (params, context) => {
    return await recursoHidricoRuralImporterController(params, context);
  },
});

export async function recursoHidricoRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = recursoHidricoRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.recursoHidricoRural.count({
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

      await recursoHidricoRuralCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { divisaoOperacionalRuralImportInputSchema } from '../divisaoOperacionalRuralSchemas';
import { divisaoOperacionalRuralCreate } from './divisaoOperacionalRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/divisao-operacional-rural/importer',
  body: z.array(divisaoOperacionalRuralImportInputSchema),
  response: importerOutputSchema,
};

export const divisaoOperacionalRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_import',
  description:
    dictionary.divisaoOperacionalRural.importer?.title ||
    'Import divisoesOperacionaisRurais',
  requiredPermissions: { divisaoOperacionalRural: ['import'] },
  schema: toMcpJsonSchema(z.array(divisaoOperacionalRuralImportInputSchema)),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralImporterController(params, context);
  },
});

export async function divisaoOperacionalRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = divisaoOperacionalRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.divisaoOperacionalRural.count({
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

      await divisaoOperacionalRuralCreate(row, context);

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

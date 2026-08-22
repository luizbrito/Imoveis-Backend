import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { restricaoTerritorialRuralImportInputSchema } from '../restricaoTerritorialRuralSchemas';
import { restricaoTerritorialRuralCreate } from './restricaoTerritorialRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/restricao-territorial-rural/importer',
  body: z.array(restricaoTerritorialRuralImportInputSchema),
  response: importerOutputSchema,
};

export const restricaoTerritorialRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_import',
  description:
    dictionary.restricaoTerritorialRural.importer?.title ||
    'Import restricoesTerritoriaisRurais',
  requiredPermissions: { restricaoTerritorialRural: ['import'] },
  schema: toMcpJsonSchema(z.array(restricaoTerritorialRuralImportInputSchema)),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralImporterController(params, context);
  },
});

export async function restricaoTerritorialRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = restricaoTerritorialRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.restricaoTerritorialRural.count({
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

      await restricaoTerritorialRuralCreate(row, context);

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

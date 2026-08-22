import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { arquivoKmlImportInputSchema } from '../arquivoKmlSchemas';
import { arquivoKmlCreate } from './arquivoKmlCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/arquivo-kml/importer',
  body: z.array(arquivoKmlImportInputSchema),
  response: importerOutputSchema,
};

export const arquivoKmlImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'arquivoKml_import',
  description: dictionary.arquivoKml.importer?.title || 'Import arquivosKml',
  requiredPermissions: { arquivoKml: ['import'] },
  schema: toMcpJsonSchema(z.array(arquivoKmlImportInputSchema)),
  handler: async (params, context) => {
    return await arquivoKmlImporterController(params, context);
  },
});

export async function arquivoKmlImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = arquivoKmlImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.arquivoKml.count({
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

      await arquivoKmlCreate(row, context);

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

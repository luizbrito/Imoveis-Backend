import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { riscoRuralImportInputSchema } from '../riscoRuralSchemas';
import { riscoRuralCreate } from './riscoRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/risco-rural/importer',
  body: z.array(riscoRuralImportInputSchema),
  response: importerOutputSchema,
};

export const riscoRuralImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'riscoRural_import',
  description: dictionary.riscoRural.importer?.title || 'Import riscosRurais',
  requiredPermissions: { riscoRural: ['import'] },
  schema: toMcpJsonSchema(z.array(riscoRuralImportInputSchema)),
  handler: async (params, context) => {
    return await riscoRuralImporterController(params, context);
  },
});

export async function riscoRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = riscoRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.riscoRural.count({
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

      await riscoRuralCreate(row, context);

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

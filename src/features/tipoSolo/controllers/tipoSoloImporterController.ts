import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tipoSoloImportInputSchema } from '../tipoSoloSchemas';
import { tipoSoloCreate } from './tipoSoloCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/tipo-solo/importer',
  body: z.array(tipoSoloImportInputSchema),
  response: importerOutputSchema,
};

export const tipoSoloImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'tipoSolo_import',
  description: dictionary.tipoSolo.importer?.title || 'Import tiposSolo',
  requiredPermissions: { tipoSolo: ['import'] },
  schema: toMcpJsonSchema(z.array(tipoSoloImportInputSchema)),
  handler: async (params, context) => {
    return await tipoSoloImporterController(params, context);
  },
});

export async function tipoSoloImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = tipoSoloImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.tipoSolo.count({
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

      await tipoSoloCreate(row, context);

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

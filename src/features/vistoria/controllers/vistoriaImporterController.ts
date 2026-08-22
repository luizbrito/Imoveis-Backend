import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vistoriaImportInputSchema } from '../vistoriaSchemas';
import { vistoriaCreate } from './vistoriaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/vistoria/importer',
  body: z.array(vistoriaImportInputSchema),
  response: importerOutputSchema,
};

export const vistoriaImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_import',
  description: dictionary.vistoria.importer?.title || 'Import vistorias',
  requiredPermissions: { vistoria: ['import'] },
  schema: toMcpJsonSchema(z.array(vistoriaImportInputSchema)),
  handler: async (params, context) => {
    return await vistoriaImporterController(params, context);
  },
});

export async function vistoriaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = vistoriaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.vistoria.count({
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

      await vistoriaCreate(row, context);

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

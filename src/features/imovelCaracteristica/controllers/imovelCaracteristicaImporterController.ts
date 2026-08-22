import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { imovelCaracteristicaImportInputSchema } from '../imovelCaracteristicaSchemas';
import { imovelCaracteristicaCreate } from './imovelCaracteristicaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/imovel-caracteristica/importer',
  body: z.array(imovelCaracteristicaImportInputSchema),
  response: importerOutputSchema,
};

export const imovelCaracteristicaImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_import',
  description:
    dictionary.imovelCaracteristica.importer?.title ||
    'Import imoveisCaracteristicas',
  requiredPermissions: { imovelCaracteristica: ['import'] },
  schema: toMcpJsonSchema(z.array(imovelCaracteristicaImportInputSchema)),
  handler: async (params, context) => {
    return await imovelCaracteristicaImporterController(params, context);
  },
});

export async function imovelCaracteristicaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = imovelCaracteristicaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.imovelCaracteristica.count({
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

      await imovelCaracteristicaCreate(row, context);

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

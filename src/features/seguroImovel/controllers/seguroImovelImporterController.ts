import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { seguroImovelImportInputSchema } from '../seguroImovelSchemas';
import { seguroImovelCreate } from './seguroImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/seguro-imovel/importer',
  body: z.array(seguroImovelImportInputSchema),
  response: importerOutputSchema,
};

export const seguroImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguroImovel_import',
  description:
    dictionary.seguroImovel.importer?.title || 'Import segurosImovel',
  requiredPermissions: { seguroImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(seguroImovelImportInputSchema)),
  handler: async (params, context) => {
    return await seguroImovelImporterController(params, context);
  },
});

export async function seguroImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = seguroImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.seguroImovel.count({
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

      await seguroImovelCreate(row, context);

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

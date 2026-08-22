import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { midiaImovelImportInputSchema } from '../midiaImovelSchemas';
import { midiaImovelCreate } from './midiaImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/midia-imovel/importer',
  body: z.array(midiaImovelImportInputSchema),
  response: importerOutputSchema,
};

export const midiaImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midiaImovel_import',
  description: dictionary.midiaImovel.importer?.title || 'Import midiasImovel',
  requiredPermissions: { midiaImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(midiaImovelImportInputSchema)),
  handler: async (params, context) => {
    return await midiaImovelImporterController(params, context);
  },
});

export async function midiaImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = midiaImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.midiaImovel.count({
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

      await midiaImovelCreate(row, context);

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

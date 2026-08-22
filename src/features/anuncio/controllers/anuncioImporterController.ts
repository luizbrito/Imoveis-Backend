import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { anuncioImportInputSchema } from '../anuncioSchemas';
import { anuncioCreate } from './anuncioCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/anuncio/importer',
  body: z.array(anuncioImportInputSchema),
  response: importerOutputSchema,
};

export const anuncioImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_import',
  description: dictionary.anuncio.importer?.title || 'Import anuncios',
  requiredPermissions: { anuncio: ['import'] },
  schema: toMcpJsonSchema(z.array(anuncioImportInputSchema)),
  handler: async (params, context) => {
    return await anuncioImporterController(params, context);
  },
});

export async function anuncioImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = anuncioImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.anuncio.count({
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

      await anuncioCreate(row, context);

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

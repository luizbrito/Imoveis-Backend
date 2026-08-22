import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaAnuncioImportInputSchema } from '../campanhaAnuncioSchemas';
import { campanhaAnuncioCreate } from './campanhaAnuncioCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/campanha-anuncio/importer',
  body: z.array(campanhaAnuncioImportInputSchema),
  response: importerOutputSchema,
};

export const campanhaAnuncioImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_import',
  description:
    dictionary.campanhaAnuncio.importer?.title || 'Import campanhasAnuncios',
  requiredPermissions: { campanhaAnuncio: ['import'] },
  schema: toMcpJsonSchema(z.array(campanhaAnuncioImportInputSchema)),
  handler: async (params, context) => {
    return await campanhaAnuncioImporterController(params, context);
  },
});

export async function campanhaAnuncioImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = campanhaAnuncioImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.campanhaAnuncio.count({
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

      await campanhaAnuncioCreate(row, context);

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

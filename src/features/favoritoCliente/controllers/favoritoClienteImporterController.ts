import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { favoritoClienteImportInputSchema } from '../favoritoClienteSchemas';
import { favoritoClienteCreate } from './favoritoClienteCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/favorito-cliente/importer',
  body: z.array(favoritoClienteImportInputSchema),
  response: importerOutputSchema,
};

export const favoritoClienteImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_import',
  description:
    dictionary.favoritoCliente.importer?.title || 'Import favoritosCliente',
  requiredPermissions: { favoritoCliente: ['import'] },
  schema: toMcpJsonSchema(z.array(favoritoClienteImportInputSchema)),
  handler: async (params, context) => {
    return await favoritoClienteImporterController(params, context);
  },
});

export async function favoritoClienteImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = favoritoClienteImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.favoritoCliente.count({
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

      await favoritoClienteCreate(row, context);

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

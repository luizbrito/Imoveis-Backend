import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { clienteImportInputSchema } from '../clienteSchemas';
import { clienteCreate } from './clienteCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cliente/importer',
  body: z.array(clienteImportInputSchema),
  response: importerOutputSchema,
};

export const clienteImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_import',
  description: dictionary.cliente.importer?.title || 'Import clientes',
  requiredPermissions: { cliente: ['import'] },
  schema: toMcpJsonSchema(z.array(clienteImportInputSchema)),
  handler: async (params, context) => {
    return await clienteImporterController(params, context);
  },
});

export async function clienteImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = clienteImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.cliente.count({
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

      await clienteCreate(row, context);

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

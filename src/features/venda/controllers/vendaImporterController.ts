import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vendaImportInputSchema } from '../vendaSchemas';
import { vendaCreate } from './vendaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/venda/importer',
  body: z.array(vendaImportInputSchema),
  response: importerOutputSchema,
};

export const vendaImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_import',
  description: dictionary.venda.importer?.title || 'Import vendas',
  requiredPermissions: { venda: ['import'] },
  schema: toMcpJsonSchema(z.array(vendaImportInputSchema)),
  handler: async (params, context) => {
    return await vendaImporterController(params, context);
  },
});

export async function vendaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = vendaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.venda.count({
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

      await vendaCreate(row, context);

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

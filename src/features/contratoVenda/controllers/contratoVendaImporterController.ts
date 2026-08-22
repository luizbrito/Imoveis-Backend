import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoVendaImportInputSchema } from '../contratoVendaSchemas';
import { contratoVendaCreate } from './contratoVendaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-venda/importer',
  body: z.array(contratoVendaImportInputSchema),
  response: importerOutputSchema,
};

export const contratoVendaImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_import',
  description:
    dictionary.contratoVenda.importer?.title || 'Import contratosVenda',
  requiredPermissions: { contratoVenda: ['import'] },
  schema: toMcpJsonSchema(z.array(contratoVendaImportInputSchema)),
  handler: async (params, context) => {
    return await contratoVendaImporterController(params, context);
  },
});

export async function contratoVendaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = contratoVendaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.contratoVenda.count({
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

      await contratoVendaCreate(row, context);

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

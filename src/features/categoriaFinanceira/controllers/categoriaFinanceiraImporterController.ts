import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { categoriaFinanceiraImportInputSchema } from '../categoriaFinanceiraSchemas';
import { categoriaFinanceiraCreate } from './categoriaFinanceiraCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/categoria-financeira/importer',
  body: z.array(categoriaFinanceiraImportInputSchema),
  response: importerOutputSchema,
};

export const categoriaFinanceiraImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_import',
  description:
    dictionary.categoriaFinanceira.importer?.title ||
    'Import categoriasFinanceiras',
  requiredPermissions: { categoriaFinanceira: ['import'] },
  schema: toMcpJsonSchema(z.array(categoriaFinanceiraImportInputSchema)),
  handler: async (params, context) => {
    return await categoriaFinanceiraImporterController(params, context);
  },
});

export async function categoriaFinanceiraImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = categoriaFinanceiraImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.categoriaFinanceira.count({
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

      await categoriaFinanceiraCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contaFinanceiraImportInputSchema } from '../contaFinanceiraSchemas';
import { contaFinanceiraCreate } from './contaFinanceiraCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/conta-financeira/importer',
  body: z.array(contaFinanceiraImportInputSchema),
  response: importerOutputSchema,
};

export const contaFinanceiraImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_import',
  description:
    dictionary.contaFinanceira.importer?.title || 'Import contasFinanceiras',
  requiredPermissions: { contaFinanceira: ['import'] },
  schema: toMcpJsonSchema(z.array(contaFinanceiraImportInputSchema)),
  handler: async (params, context) => {
    return await contaFinanceiraImporterController(params, context);
  },
});

export async function contaFinanceiraImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = contaFinanceiraImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.contaFinanceira.count({
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

      await contaFinanceiraCreate(row, context);

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

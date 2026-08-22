import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { lancamentoFinanceiroImportInputSchema } from '../lancamentoFinanceiroSchemas';
import { lancamentoFinanceiroCreate } from './lancamentoFinanceiroCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/lancamento-financeiro/importer',
  body: z.array(lancamentoFinanceiroImportInputSchema),
  response: importerOutputSchema,
};

export const lancamentoFinanceiroImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_import',
  description:
    dictionary.lancamentoFinanceiro.importer?.title ||
    'Import lancamentosFinanceiros',
  requiredPermissions: { lancamentoFinanceiro: ['import'] },
  schema: toMcpJsonSchema(z.array(lancamentoFinanceiroImportInputSchema)),
  handler: async (params, context) => {
    return await lancamentoFinanceiroImporterController(params, context);
  },
});

export async function lancamentoFinanceiroImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = lancamentoFinanceiroImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.lancamentoFinanceiro.count({
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

      await lancamentoFinanceiroCreate(row, context);

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

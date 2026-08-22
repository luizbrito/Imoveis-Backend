import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { simulacaoFinanciamentoImportInputSchema } from '../simulacaoFinanciamentoSchemas';
import { simulacaoFinanciamentoCreate } from './simulacaoFinanciamentoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/simulacao-financiamento/importer',
  body: z.array(simulacaoFinanciamentoImportInputSchema),
  response: importerOutputSchema,
};

export const simulacaoFinanciamentoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_import',
  description:
    dictionary.simulacaoFinanciamento.importer?.title ||
    'Import simulacoesFinanciamento',
  requiredPermissions: { simulacaoFinanciamento: ['import'] },
  schema: toMcpJsonSchema(z.array(simulacaoFinanciamentoImportInputSchema)),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoImporterController(params, context);
  },
});

export async function simulacaoFinanciamentoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = simulacaoFinanciamentoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.simulacaoFinanciamento.count({
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

      await simulacaoFinanciamentoCreate(row, context);

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

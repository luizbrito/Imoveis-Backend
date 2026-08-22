import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cobrancaLocacaoImportInputSchema } from '../cobrancaLocacaoSchemas';
import { cobrancaLocacaoCreate } from './cobrancaLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cobranca-locacao/importer',
  body: z.array(cobrancaLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const cobrancaLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_import',
  description:
    dictionary.cobrancaLocacao.importer?.title || 'Import cobrancasLocacao',
  requiredPermissions: { cobrancaLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(cobrancaLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await cobrancaLocacaoImporterController(params, context);
  },
});

export async function cobrancaLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = cobrancaLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.cobrancaLocacao.count({
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

      await cobrancaLocacaoCreate(row, context);

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

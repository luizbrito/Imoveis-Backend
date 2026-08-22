import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reajusteLocacaoImportInputSchema } from '../reajusteLocacaoSchemas';
import { reajusteLocacaoCreate } from './reajusteLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/reajuste-locacao/importer',
  body: z.array(reajusteLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const reajusteLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_import',
  description:
    dictionary.reajusteLocacao.importer?.title || 'Import reajustesLocacao',
  requiredPermissions: { reajusteLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(reajusteLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await reajusteLocacaoImporterController(params, context);
  },
});

export async function reajusteLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = reajusteLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.reajusteLocacao.count({
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

      await reajusteLocacaoCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoLocacaoImportInputSchema } from '../pagamentoLocacaoSchemas';
import { pagamentoLocacaoCreate } from './pagamentoLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pagamento-locacao/importer',
  body: z.array(pagamentoLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const pagamentoLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_import',
  description:
    dictionary.pagamentoLocacao.importer?.title || 'Import pagamentosLocacao',
  requiredPermissions: { pagamentoLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(pagamentoLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await pagamentoLocacaoImporterController(params, context);
  },
});

export async function pagamentoLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = pagamentoLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.pagamentoLocacao.count({
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

      await pagamentoLocacaoCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pagamentoComissaoImportInputSchema } from '../pagamentoComissaoSchemas';
import { pagamentoComissaoCreate } from './pagamentoComissaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pagamento-comissao/importer',
  body: z.array(pagamentoComissaoImportInputSchema),
  response: importerOutputSchema,
};

export const pagamentoComissaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_import',
  description:
    dictionary.pagamentoComissao.importer?.title || 'Import pagamentosComissao',
  requiredPermissions: { pagamentoComissao: ['import'] },
  schema: toMcpJsonSchema(z.array(pagamentoComissaoImportInputSchema)),
  handler: async (params, context) => {
    return await pagamentoComissaoImporterController(params, context);
  },
});

export async function pagamentoComissaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = pagamentoComissaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.pagamentoComissao.count({
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

      await pagamentoComissaoCreate(row, context);

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

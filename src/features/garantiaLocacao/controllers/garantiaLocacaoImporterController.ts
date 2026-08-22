import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { garantiaLocacaoImportInputSchema } from '../garantiaLocacaoSchemas';
import { garantiaLocacaoCreate } from './garantiaLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/garantia-locacao/importer',
  body: z.array(garantiaLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const garantiaLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_import',
  description:
    dictionary.garantiaLocacao.importer?.title || 'Import garantiasLocacao',
  requiredPermissions: { garantiaLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(garantiaLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await garantiaLocacaoImporterController(params, context);
  },
});

export async function garantiaLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = garantiaLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.garantiaLocacao.count({
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

      await garantiaLocacaoCreate(row, context);

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

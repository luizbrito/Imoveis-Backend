import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { avaliacaoImovelImportInputSchema } from '../avaliacaoImovelSchemas';
import { avaliacaoImovelCreate } from './avaliacaoImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/avaliacao-imovel/importer',
  body: z.array(avaliacaoImovelImportInputSchema),
  response: importerOutputSchema,
};

export const avaliacaoImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_import',
  description:
    dictionary.avaliacaoImovel.importer?.title || 'Import avaliacoesImovel',
  requiredPermissions: { avaliacaoImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(avaliacaoImovelImportInputSchema)),
  handler: async (params, context) => {
    return await avaliacaoImovelImporterController(params, context);
  },
});

export async function avaliacaoImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = avaliacaoImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.avaliacaoImovel.count({
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

      await avaliacaoImovelCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { despesaImovelImportInputSchema } from '../despesaImovelSchemas';
import { despesaImovelCreate } from './despesaImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/despesa-imovel/importer',
  body: z.array(despesaImovelImportInputSchema),
  response: importerOutputSchema,
};

export const despesaImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_import',
  description:
    dictionary.despesaImovel.importer?.title || 'Import despesasImovel',
  requiredPermissions: { despesaImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(despesaImovelImportInputSchema)),
  handler: async (params, context) => {
    return await despesaImovelImporterController(params, context);
  },
});

export async function despesaImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = despesaImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.despesaImovel.count({
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

      await despesaImovelCreate(row, context);

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

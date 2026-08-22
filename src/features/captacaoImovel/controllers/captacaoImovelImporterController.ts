import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { captacaoImovelImportInputSchema } from '../captacaoImovelSchemas';
import { captacaoImovelCreate } from './captacaoImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/captacao-imovel/importer',
  body: z.array(captacaoImovelImportInputSchema),
  response: importerOutputSchema,
};

export const captacaoImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_import',
  description:
    dictionary.captacaoImovel.importer?.title || 'Import captacoesImovel',
  requiredPermissions: { captacaoImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(captacaoImovelImportInputSchema)),
  handler: async (params, context) => {
    return await captacaoImovelImporterController(params, context);
  },
});

export async function captacaoImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = captacaoImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.captacaoImovel.count({
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

      await captacaoImovelCreate(row, context);

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

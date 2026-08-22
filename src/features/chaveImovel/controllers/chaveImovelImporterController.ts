import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { chaveImovelImportInputSchema } from '../chaveImovelSchemas';
import { chaveImovelCreate } from './chaveImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/chave-imovel/importer',
  body: z.array(chaveImovelImportInputSchema),
  response: importerOutputSchema,
};

export const chaveImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chaveImovel_import',
  description: dictionary.chaveImovel.importer?.title || 'Import chavesImovel',
  requiredPermissions: { chaveImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(chaveImovelImportInputSchema)),
  handler: async (params, context) => {
    return await chaveImovelImporterController(params, context);
  },
});

export async function chaveImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = chaveImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.chaveImovel.count({
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

      await chaveImovelCreate(row, context);

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

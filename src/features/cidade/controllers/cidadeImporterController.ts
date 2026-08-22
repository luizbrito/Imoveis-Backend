import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cidadeImportInputSchema } from '../cidadeSchemas';
import { cidadeCreate } from './cidadeCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cidade/importer',
  body: z.array(cidadeImportInputSchema),
  response: importerOutputSchema,
};

export const cidadeImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_import',
  description: dictionary.cidade.importer?.title || 'Import cidades',
  requiredPermissions: { cidade: ['import'] },
  schema: toMcpJsonSchema(z.array(cidadeImportInputSchema)),
  handler: async (params, context) => {
    return await cidadeImporterController(params, context);
  },
});

export async function cidadeImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = cidadeImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.cidade.count({
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

      await cidadeCreate(row, context);

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

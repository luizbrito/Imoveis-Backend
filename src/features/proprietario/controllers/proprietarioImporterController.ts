import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { proprietarioImportInputSchema } from '../proprietarioSchemas';
import { proprietarioCreate } from './proprietarioCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/proprietario/importer',
  body: z.array(proprietarioImportInputSchema),
  response: importerOutputSchema,
};

export const proprietarioImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_import',
  description:
    dictionary.proprietario.importer?.title || 'Import proprietarios',
  requiredPermissions: { proprietario: ['import'] },
  schema: toMcpJsonSchema(z.array(proprietarioImportInputSchema)),
  handler: async (params, context) => {
    return await proprietarioImporterController(params, context);
  },
});

export async function proprietarioImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = proprietarioImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.proprietario.count({
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

      await proprietarioCreate(row, context);

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

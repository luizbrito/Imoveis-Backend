import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { corretorImportInputSchema } from '../corretorSchemas';
import { corretorCreate } from './corretorCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/corretor/importer',
  body: z.array(corretorImportInputSchema),
  response: importerOutputSchema,
};

export const corretorImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_import',
  description: dictionary.corretor.importer?.title || 'Import corretores',
  requiredPermissions: { corretor: ['import'] },
  schema: toMcpJsonSchema(z.array(corretorImportInputSchema)),
  handler: async (params, context) => {
    return await corretorImporterController(params, context);
  },
});

export async function corretorImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = corretorImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.corretor.count({
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

      await corretorCreate(row, context);

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

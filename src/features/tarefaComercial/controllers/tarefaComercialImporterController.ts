import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { tarefaComercialImportInputSchema } from '../tarefaComercialSchemas';
import { tarefaComercialCreate } from './tarefaComercialCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/tarefa-comercial/importer',
  body: z.array(tarefaComercialImportInputSchema),
  response: importerOutputSchema,
};

export const tarefaComercialImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_import',
  description:
    dictionary.tarefaComercial.importer?.title || 'Import tarefasComerciais',
  requiredPermissions: { tarefaComercial: ['import'] },
  schema: toMcpJsonSchema(z.array(tarefaComercialImportInputSchema)),
  handler: async (params, context) => {
    return await tarefaComercialImporterController(params, context);
  },
});

export async function tarefaComercialImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = tarefaComercialImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.tarefaComercial.count({
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

      await tarefaComercialCreate(row, context);

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

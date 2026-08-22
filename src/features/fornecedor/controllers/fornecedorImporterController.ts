import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { fornecedorImportInputSchema } from '../fornecedorSchemas';
import { fornecedorCreate } from './fornecedorCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/fornecedor/importer',
  body: z.array(fornecedorImportInputSchema),
  response: importerOutputSchema,
};

export const fornecedorImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'fornecedor_import',
  description: dictionary.fornecedor.importer?.title || 'Import fornecedores',
  requiredPermissions: { fornecedor: ['import'] },
  schema: toMcpJsonSchema(z.array(fornecedorImportInputSchema)),
  handler: async (params, context) => {
    return await fornecedorImporterController(params, context);
  },
});

export async function fornecedorImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = fornecedorImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.fornecedor.count({
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

      await fornecedorCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoImovelImportInputSchema } from '../documentoImovelSchemas';
import { documentoImovelCreate } from './documentoImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documento-imovel/importer',
  body: z.array(documentoImovelImportInputSchema),
  response: importerOutputSchema,
};

export const documentoImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_import',
  description:
    dictionary.documentoImovel.importer?.title || 'Import documentosImovel',
  requiredPermissions: { documentoImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(documentoImovelImportInputSchema)),
  handler: async (params, context) => {
    return await documentoImovelImporterController(params, context);
  },
});

export async function documentoImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = documentoImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.documentoImovel.count({
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

      await documentoImovelCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ocorrenciaImovelImportInputSchema } from '../ocorrenciaImovelSchemas';
import { ocorrenciaImovelCreate } from './ocorrenciaImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ocorrencia-imovel/importer',
  body: z.array(ocorrenciaImovelImportInputSchema),
  response: importerOutputSchema,
};

export const ocorrenciaImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_import',
  description:
    dictionary.ocorrenciaImovel.importer?.title || 'Import ocorrenciasImovel',
  requiredPermissions: { ocorrenciaImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(ocorrenciaImovelImportInputSchema)),
  handler: async (params, context) => {
    return await ocorrenciaImovelImporterController(params, context);
  },
});

export async function ocorrenciaImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = ocorrenciaImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.ocorrenciaImovel.count({
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

      await ocorrenciaImovelCreate(row, context);

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

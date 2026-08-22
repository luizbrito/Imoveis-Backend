import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { caracteristicaImovelImportInputSchema } from '../caracteristicaImovelSchemas';
import { caracteristicaImovelCreate } from './caracteristicaImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/caracteristica-imovel/importer',
  body: z.array(caracteristicaImovelImportInputSchema),
  response: importerOutputSchema,
};

export const caracteristicaImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_import',
  description:
    dictionary.caracteristicaImovel.importer?.title ||
    'Import caracteristicasImovel',
  requiredPermissions: { caracteristicaImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(caracteristicaImovelImportInputSchema)),
  handler: async (params, context) => {
    return await caracteristicaImovelImporterController(params, context);
  },
});

export async function caracteristicaImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = caracteristicaImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.caracteristicaImovel.count({
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

      await caracteristicaImovelCreate(row, context);

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

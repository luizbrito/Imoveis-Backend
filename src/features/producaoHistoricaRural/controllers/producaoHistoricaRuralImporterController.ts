import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { producaoHistoricaRuralImportInputSchema } from '../producaoHistoricaRuralSchemas';
import { producaoHistoricaRuralCreate } from './producaoHistoricaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/producao-historica-rural/importer',
  body: z.array(producaoHistoricaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const producaoHistoricaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_import',
  description:
    dictionary.producaoHistoricaRural.importer?.title ||
    'Import producoesHistoricasRurais',
  requiredPermissions: { producaoHistoricaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(producaoHistoricaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await producaoHistoricaRuralImporterController(params, context);
  },
});

export async function producaoHistoricaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = producaoHistoricaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.producaoHistoricaRural.count({
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

      await producaoHistoricaRuralCreate(row, context);

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

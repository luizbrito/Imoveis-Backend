import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoComercialRuralImportInputSchema } from '../condicaoComercialRuralSchemas';
import { condicaoComercialRuralCreate } from './condicaoComercialRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/condicao-comercial-rural/importer',
  body: z.array(condicaoComercialRuralImportInputSchema),
  response: importerOutputSchema,
};

export const condicaoComercialRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_import',
  description:
    dictionary.condicaoComercialRural.importer?.title ||
    'Import condicoesComerciaisRurais',
  requiredPermissions: { condicaoComercialRural: ['import'] },
  schema: toMcpJsonSchema(z.array(condicaoComercialRuralImportInputSchema)),
  handler: async (params, context) => {
    return await condicaoComercialRuralImporterController(params, context);
  },
});

export async function condicaoComercialRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = condicaoComercialRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.condicaoComercialRural.count({
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

      await condicaoComercialRuralCreate(row, context);

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

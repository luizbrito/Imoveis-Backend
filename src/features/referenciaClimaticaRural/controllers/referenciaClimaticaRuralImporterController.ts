import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { referenciaClimaticaRuralImportInputSchema } from '../referenciaClimaticaRuralSchemas';
import { referenciaClimaticaRuralCreate } from './referenciaClimaticaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/referencia-climatica-rural/importer',
  body: z.array(referenciaClimaticaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const referenciaClimaticaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_import',
  description:
    dictionary.referenciaClimaticaRural.importer?.title ||
    'Import referenciasClimaticasRurais',
  requiredPermissions: { referenciaClimaticaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(referenciaClimaticaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralImporterController(params, context);
  },
});

export async function referenciaClimaticaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = referenciaClimaticaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.referenciaClimaticaRural.count({
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

      await referenciaClimaticaRuralCreate(row, context);

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

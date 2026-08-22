import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { dueDiligenceRuralImportInputSchema } from '../dueDiligenceRuralSchemas';
import { dueDiligenceRuralCreate } from './dueDiligenceRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/due-diligence-rural/importer',
  body: z.array(dueDiligenceRuralImportInputSchema),
  response: importerOutputSchema,
};

export const dueDiligenceRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_import',
  description:
    dictionary.dueDiligenceRural.importer?.title ||
    'Import dueDiligencesRurais',
  requiredPermissions: { dueDiligenceRural: ['import'] },
  schema: toMcpJsonSchema(z.array(dueDiligenceRuralImportInputSchema)),
  handler: async (params, context) => {
    return await dueDiligenceRuralImporterController(params, context);
  },
});

export async function dueDiligenceRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = dueDiligenceRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.dueDiligenceRural.count({
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

      await dueDiligenceRuralCreate(row, context);

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

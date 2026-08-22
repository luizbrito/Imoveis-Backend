import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { soloImovelRuralImportInputSchema } from '../soloImovelRuralSchemas';
import { soloImovelRuralCreate } from './soloImovelRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solo-imovel-rural/importer',
  body: z.array(soloImovelRuralImportInputSchema),
  response: importerOutputSchema,
};

export const soloImovelRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_import',
  description:
    dictionary.soloImovelRural.importer?.title || 'Import solosImoveisRurais',
  requiredPermissions: { soloImovelRural: ['import'] },
  schema: toMcpJsonSchema(z.array(soloImovelRuralImportInputSchema)),
  handler: async (params, context) => {
    return await soloImovelRuralImporterController(params, context);
  },
});

export async function soloImovelRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = soloImovelRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.soloImovelRural.count({
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

      await soloImovelRuralCreate(row, context);

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

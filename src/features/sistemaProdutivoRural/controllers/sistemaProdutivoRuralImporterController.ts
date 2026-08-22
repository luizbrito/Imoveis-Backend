import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { sistemaProdutivoRuralImportInputSchema } from '../sistemaProdutivoRuralSchemas';
import { sistemaProdutivoRuralCreate } from './sistemaProdutivoRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/sistema-produtivo-rural/importer',
  body: z.array(sistemaProdutivoRuralImportInputSchema),
  response: importerOutputSchema,
};

export const sistemaProdutivoRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_import',
  description:
    dictionary.sistemaProdutivoRural.importer?.title ||
    'Import sistemasProdutivosRurais',
  requiredPermissions: { sistemaProdutivoRural: ['import'] },
  schema: toMcpJsonSchema(z.array(sistemaProdutivoRuralImportInputSchema)),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralImporterController(params, context);
  },
});

export async function sistemaProdutivoRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = sistemaProdutivoRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.sistemaProdutivoRural.count({
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

      await sistemaProdutivoRuralCreate(row, context);

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

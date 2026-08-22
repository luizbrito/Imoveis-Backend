import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { portalImobiliarioImportInputSchema } from '../portalImobiliarioSchemas';
import { portalImobiliarioCreate } from './portalImobiliarioCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/portal-imobiliario/importer',
  body: z.array(portalImobiliarioImportInputSchema),
  response: importerOutputSchema,
};

export const portalImobiliarioImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_import',
  description:
    dictionary.portalImobiliario.importer?.title ||
    'Import portaisImobiliarios',
  requiredPermissions: { portalImobiliario: ['import'] },
  schema: toMcpJsonSchema(z.array(portalImobiliarioImportInputSchema)),
  handler: async (params, context) => {
    return await portalImobiliarioImporterController(params, context);
  },
});

export async function portalImobiliarioImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = portalImobiliarioImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.portalImobiliario.count({
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

      await portalImobiliarioCreate(row, context);

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

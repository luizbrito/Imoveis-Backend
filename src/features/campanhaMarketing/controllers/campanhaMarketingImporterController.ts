import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { campanhaMarketingImportInputSchema } from '../campanhaMarketingSchemas';
import { campanhaMarketingCreate } from './campanhaMarketingCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/campanha-marketing/importer',
  body: z.array(campanhaMarketingImportInputSchema),
  response: importerOutputSchema,
};

export const campanhaMarketingImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_import',
  description:
    dictionary.campanhaMarketing.importer?.title || 'Import campanhasMarketing',
  requiredPermissions: { campanhaMarketing: ['import'] },
  schema: toMcpJsonSchema(z.array(campanhaMarketingImportInputSchema)),
  handler: async (params, context) => {
    return await campanhaMarketingImporterController(params, context);
  },
});

export async function campanhaMarketingImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = campanhaMarketingImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.campanhaMarketing.count({
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

      await campanhaMarketingCreate(row, context);

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

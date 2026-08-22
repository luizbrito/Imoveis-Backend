import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { repasseProprietarioImportInputSchema } from '../repasseProprietarioSchemas';
import { repasseProprietarioCreate } from './repasseProprietarioCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/repasse-proprietario/importer',
  body: z.array(repasseProprietarioImportInputSchema),
  response: importerOutputSchema,
};

export const repasseProprietarioImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_import',
  description:
    dictionary.repasseProprietario.importer?.title ||
    'Import repassesProprietario',
  requiredPermissions: { repasseProprietario: ['import'] },
  schema: toMcpJsonSchema(z.array(repasseProprietarioImportInputSchema)),
  handler: async (params, context) => {
    return await repasseProprietarioImporterController(params, context);
  },
});

export async function repasseProprietarioImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = repasseProprietarioImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.repasseProprietario.count({
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

      await repasseProprietarioCreate(row, context);

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

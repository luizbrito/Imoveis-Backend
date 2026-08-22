import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoAdministracaoImportInputSchema } from '../contratoAdministracaoSchemas';
import { contratoAdministracaoCreate } from './contratoAdministracaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-administracao/importer',
  body: z.array(contratoAdministracaoImportInputSchema),
  response: importerOutputSchema,
};

export const contratoAdministracaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_import',
  description:
    dictionary.contratoAdministracao.importer?.title ||
    'Import contratosAdministracao',
  requiredPermissions: { contratoAdministracao: ['import'] },
  schema: toMcpJsonSchema(z.array(contratoAdministracaoImportInputSchema)),
  handler: async (params, context) => {
    return await contratoAdministracaoImporterController(params, context);
  },
});

export async function contratoAdministracaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = contratoAdministracaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.contratoAdministracao.count({
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

      await contratoAdministracaoCreate(row, context);

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

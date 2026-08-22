import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { empreendimentoImportInputSchema } from '../empreendimentoSchemas';
import { empreendimentoCreate } from './empreendimentoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/empreendimento/importer',
  body: z.array(empreendimentoImportInputSchema),
  response: importerOutputSchema,
};

export const empreendimentoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_import',
  description:
    dictionary.empreendimento.importer?.title || 'Import empreendimentos',
  requiredPermissions: { empreendimento: ['import'] },
  schema: toMcpJsonSchema(z.array(empreendimentoImportInputSchema)),
  handler: async (params, context) => {
    return await empreendimentoImporterController(params, context);
  },
});

export async function empreendimentoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = empreendimentoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.empreendimento.count({
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

      await empreendimentoCreate(row, context);

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

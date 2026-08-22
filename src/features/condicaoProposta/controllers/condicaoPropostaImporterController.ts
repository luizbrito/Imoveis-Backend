import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoPropostaImportInputSchema } from '../condicaoPropostaSchemas';
import { condicaoPropostaCreate } from './condicaoPropostaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/condicao-proposta/importer',
  body: z.array(condicaoPropostaImportInputSchema),
  response: importerOutputSchema,
};

export const condicaoPropostaImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_import',
  description:
    dictionary.condicaoProposta.importer?.title || 'Import condicoesProposta',
  requiredPermissions: { condicaoProposta: ['import'] },
  schema: toMcpJsonSchema(z.array(condicaoPropostaImportInputSchema)),
  handler: async (params, context) => {
    return await condicaoPropostaImporterController(params, context);
  },
});

export async function condicaoPropostaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = condicaoPropostaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.condicaoProposta.count({
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

      await condicaoPropostaCreate(row, context);

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

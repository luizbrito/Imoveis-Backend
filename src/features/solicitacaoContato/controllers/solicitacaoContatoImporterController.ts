import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoContatoImportInputSchema } from '../solicitacaoContatoSchemas';
import { solicitacaoContatoCreate } from './solicitacaoContatoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solicitacao-contato/importer',
  body: z.array(solicitacaoContatoImportInputSchema),
  response: importerOutputSchema,
};

export const solicitacaoContatoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_import',
  description:
    dictionary.solicitacaoContato.importer?.title ||
    'Import solicitacoesContato',
  requiredPermissions: { solicitacaoContato: ['import'] },
  schema: toMcpJsonSchema(z.array(solicitacaoContatoImportInputSchema)),
  handler: async (params, context) => {
    return await solicitacaoContatoImporterController(params, context);
  },
});

export async function solicitacaoContatoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = solicitacaoContatoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.solicitacaoContato.count({
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

      await solicitacaoContatoCreate(row, context);

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

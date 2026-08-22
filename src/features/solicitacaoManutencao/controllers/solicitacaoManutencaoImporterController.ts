import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoManutencaoImportInputSchema } from '../solicitacaoManutencaoSchemas';
import { solicitacaoManutencaoCreate } from './solicitacaoManutencaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solicitacao-manutencao/importer',
  body: z.array(solicitacaoManutencaoImportInputSchema),
  response: importerOutputSchema,
};

export const solicitacaoManutencaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_import',
  description:
    dictionary.solicitacaoManutencao.importer?.title ||
    'Import solicitacoesManutencao',
  requiredPermissions: { solicitacaoManutencao: ['import'] },
  schema: toMcpJsonSchema(z.array(solicitacaoManutencaoImportInputSchema)),
  handler: async (params, context) => {
    return await solicitacaoManutencaoImporterController(params, context);
  },
});

export async function solicitacaoManutencaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = solicitacaoManutencaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.solicitacaoManutencao.count({
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

      await solicitacaoManutencaoCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { participanteLocacaoImportInputSchema } from '../participanteLocacaoSchemas';
import { participanteLocacaoCreate } from './participanteLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/participante-locacao/importer',
  body: z.array(participanteLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const participanteLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_import',
  description:
    dictionary.participanteLocacao.importer?.title ||
    'Import participantesLocacao',
  requiredPermissions: { participanteLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(participanteLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await participanteLocacaoImporterController(params, context);
  },
});

export async function participanteLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = participanteLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.participanteLocacao.count({
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

      await participanteLocacaoCreate(row, context);

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

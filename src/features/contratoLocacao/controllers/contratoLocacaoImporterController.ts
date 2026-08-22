import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoLocacaoImportInputSchema } from '../contratoLocacaoSchemas';
import { contratoLocacaoCreate } from './contratoLocacaoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-locacao/importer',
  body: z.array(contratoLocacaoImportInputSchema),
  response: importerOutputSchema,
};

export const contratoLocacaoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_import',
  description:
    dictionary.contratoLocacao.importer?.title || 'Import contratosLocacao',
  requiredPermissions: { contratoLocacao: ['import'] },
  schema: toMcpJsonSchema(z.array(contratoLocacaoImportInputSchema)),
  handler: async (params, context) => {
    return await contratoLocacaoImporterController(params, context);
  },
});

export async function contratoLocacaoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = contratoLocacaoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.contratoLocacao.count({
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

      await contratoLocacaoCreate(row, context);

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

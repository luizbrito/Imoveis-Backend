import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentacaoRuralBrasilImportInputSchema } from '../documentacaoRuralBrasilSchemas';
import { documentacaoRuralBrasilCreate } from './documentacaoRuralBrasilCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documentacao-rural-brasil/importer',
  body: z.array(documentacaoRuralBrasilImportInputSchema),
  response: importerOutputSchema,
};

export const documentacaoRuralBrasilImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_import',
  description:
    dictionary.documentacaoRuralBrasil.importer?.title ||
    'Import documentacoesRuraisBrasil',
  requiredPermissions: { documentacaoRuralBrasil: ['import'] },
  schema: toMcpJsonSchema(z.array(documentacaoRuralBrasilImportInputSchema)),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilImporterController(params, context);
  },
});

export async function documentacaoRuralBrasilImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = documentacaoRuralBrasilImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.documentacaoRuralBrasil.count({
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

      await documentacaoRuralBrasilCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentoPessoaImportInputSchema } from '../documentoPessoaSchemas';
import { documentoPessoaCreate } from './documentoPessoaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/documento-pessoa/importer',
  body: z.array(documentoPessoaImportInputSchema),
  response: importerOutputSchema,
};

export const documentoPessoaImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_import',
  description:
    dictionary.documentoPessoa.importer?.title || 'Import documentosPessoas',
  requiredPermissions: { documentoPessoa: ['import'] },
  schema: toMcpJsonSchema(z.array(documentoPessoaImportInputSchema)),
  handler: async (params, context) => {
    return await documentoPessoaImporterController(params, context);
  },
});

export async function documentoPessoaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = documentoPessoaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.documentoPessoa.count({
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

      await documentoPessoaCreate(row, context);

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

import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { consentimentoLGPDImportInputSchema } from '../consentimentoLGPDSchemas';
import { consentimentoLGPDCreate } from './consentimentoLGPDCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/consentimento-l-g-p-d/importer',
  body: z.array(consentimentoLGPDImportInputSchema),
  response: importerOutputSchema,
};

export const consentimentoLGPDImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_import',
  description:
    dictionary.consentimentoLGPD.importer?.title || 'Import consentimentosLGPD',
  requiredPermissions: { consentimentoLGPD: ['import'] },
  schema: toMcpJsonSchema(z.array(consentimentoLGPDImportInputSchema)),
  handler: async (params, context) => {
    return await consentimentoLGPDImporterController(params, context);
  },
});

export async function consentimentoLGPDImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = consentimentoLGPDImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.consentimentoLGPD.count({
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

      await consentimentoLGPDCreate(row, context);

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

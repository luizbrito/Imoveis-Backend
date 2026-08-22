import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { interacaoLeadImportInputSchema } from '../interacaoLeadSchemas';
import { interacaoLeadCreate } from './interacaoLeadCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/interacao-lead/importer',
  body: z.array(interacaoLeadImportInputSchema),
  response: importerOutputSchema,
};

export const interacaoLeadImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_import',
  description:
    dictionary.interacaoLead.importer?.title || 'Import interacoesLead',
  requiredPermissions: { interacaoLead: ['import'] },
  schema: toMcpJsonSchema(z.array(interacaoLeadImportInputSchema)),
  handler: async (params, context) => {
    return await interacaoLeadImporterController(params, context);
  },
});

export async function interacaoLeadImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = interacaoLeadImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.interacaoLead.count({
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

      await interacaoLeadCreate(row, context);

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

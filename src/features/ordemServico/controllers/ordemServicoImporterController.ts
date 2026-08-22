import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ordemServicoImportInputSchema } from '../ordemServicoSchemas';
import { ordemServicoCreate } from './ordemServicoCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ordem-servico/importer',
  body: z.array(ordemServicoImportInputSchema),
  response: importerOutputSchema,
};

export const ordemServicoImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordemServico_import',
  description:
    dictionary.ordemServico.importer?.title || 'Import ordensServico',
  requiredPermissions: { ordemServico: ['import'] },
  schema: toMcpJsonSchema(z.array(ordemServicoImportInputSchema)),
  handler: async (params, context) => {
    return await ordemServicoImporterController(params, context);
  },
});

export async function ordemServicoImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = ordemServicoImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.ordemServico.count({
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

      await ordemServicoCreate(row, context);

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

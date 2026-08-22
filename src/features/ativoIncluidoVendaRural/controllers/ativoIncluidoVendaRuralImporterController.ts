import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ativoIncluidoVendaRuralImportInputSchema } from '../ativoIncluidoVendaRuralSchemas';
import { ativoIncluidoVendaRuralCreate } from './ativoIncluidoVendaRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ativo-incluido-venda-rural/importer',
  body: z.array(ativoIncluidoVendaRuralImportInputSchema),
  response: importerOutputSchema,
};

export const ativoIncluidoVendaRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_import',
  description:
    dictionary.ativoIncluidoVendaRural.importer?.title ||
    'Import ativosIncluidosVendaRural',
  requiredPermissions: { ativoIncluidoVendaRural: ['import'] },
  schema: toMcpJsonSchema(z.array(ativoIncluidoVendaRuralImportInputSchema)),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralImporterController(params, context);
  },
});

export async function ativoIncluidoVendaRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = ativoIncluidoVendaRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.ativoIncluidoVendaRural.count({
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

      await ativoIncluidoVendaRuralCreate(row, context);

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

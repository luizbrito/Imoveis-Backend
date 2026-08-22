import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { parcelaVendaImportInputSchema } from '../parcelaVendaSchemas';
import { parcelaVendaCreate } from './parcelaVendaCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/parcela-venda/importer',
  body: z.array(parcelaVendaImportInputSchema),
  response: importerOutputSchema,
};

export const parcelaVendaImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcelaVenda_import',
  description:
    dictionary.parcelaVenda.importer?.title || 'Import parcelasVenda',
  requiredPermissions: { parcelaVenda: ['import'] },
  schema: toMcpJsonSchema(z.array(parcelaVendaImportInputSchema)),
  handler: async (params, context) => {
    return await parcelaVendaImporterController(params, context);
  },
});

export async function parcelaVendaImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = parcelaVendaImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.parcelaVenda.count({
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

      await parcelaVendaCreate(row, context);

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

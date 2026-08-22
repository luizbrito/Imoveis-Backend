import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { reservaImovelImportInputSchema } from '../reservaImovelSchemas';
import { reservaImovelCreate } from './reservaImovelCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/reserva-imovel/importer',
  body: z.array(reservaImovelImportInputSchema),
  response: importerOutputSchema,
};

export const reservaImovelImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_import',
  description:
    dictionary.reservaImovel.importer?.title || 'Import reservasImovel',
  requiredPermissions: { reservaImovel: ['import'] },
  schema: toMcpJsonSchema(z.array(reservaImovelImportInputSchema)),
  handler: async (params, context) => {
    return await reservaImovelImporterController(params, context);
  },
});

export async function reservaImovelImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = reservaImovelImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.reservaImovel.count({
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

      await reservaImovelCreate(row, context);

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

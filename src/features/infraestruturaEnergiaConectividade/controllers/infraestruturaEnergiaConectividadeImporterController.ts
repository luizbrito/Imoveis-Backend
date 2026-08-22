import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { infraestruturaEnergiaConectividadeImportInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { infraestruturaEnergiaConectividadeCreate } from './infraestruturaEnergiaConectividadeCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/infraestrutura-energia-conectividade/importer',
  body: z.array(infraestruturaEnergiaConectividadeImportInputSchema),
  response: importerOutputSchema,
};

export const infraestruturaEnergiaConectividadeImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_import',
  description:
    dictionary.infraestruturaEnergiaConectividade.importer?.title ||
    'Import infraestruturasEnergiaConectividade',
  requiredPermissions: { infraestruturaEnergiaConectividade: ['import'] },
  schema: toMcpJsonSchema(
    z.array(infraestruturaEnergiaConectividadeImportInputSchema),
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeImporterController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data =
        infraestruturaEnergiaConectividadeImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.infraestruturaEnergiaConectividade.count({
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

      await infraestruturaEnergiaConectividadeCreate(row, context);

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

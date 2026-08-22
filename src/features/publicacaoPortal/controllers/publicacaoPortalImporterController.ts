import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { publicacaoPortalImportInputSchema } from '../publicacaoPortalSchemas';
import { publicacaoPortalCreate } from './publicacaoPortalCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/publicacao-portal/importer',
  body: z.array(publicacaoPortalImportInputSchema),
  response: importerOutputSchema,
};

export const publicacaoPortalImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_import',
  description:
    dictionary.publicacaoPortal.importer?.title || 'Import publicacoesPortal',
  requiredPermissions: { publicacaoPortal: ['import'] },
  schema: toMcpJsonSchema(z.array(publicacaoPortalImportInputSchema)),
  handler: async (params, context) => {
    return await publicacaoPortalImporterController(params, context);
  },
});

export async function publicacaoPortalImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = publicacaoPortalImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.publicacaoPortal.count({
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

      await publicacaoPortalCreate(row, context);

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

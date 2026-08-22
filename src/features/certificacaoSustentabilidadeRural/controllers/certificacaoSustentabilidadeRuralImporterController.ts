import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { certificacaoSustentabilidadeRuralImportInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { certificacaoSustentabilidadeRuralCreate } from './certificacaoSustentabilidadeRuralCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/certificacao-sustentabilidade-rural/importer',
  body: z.array(certificacaoSustentabilidadeRuralImportInputSchema),
  response: importerOutputSchema,
};

export const certificacaoSustentabilidadeRuralImporterMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_import',
  description:
    dictionary.certificacaoSustentabilidadeRural.importer?.title ||
    'Import certificacoesSustentabilidadeRural',
  requiredPermissions: { certificacaoSustentabilidadeRural: ['import'] },
  schema: toMcpJsonSchema(
    z.array(certificacaoSustentabilidadeRuralImportInputSchema),
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralImporterController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralImporterController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data =
        certificacaoSustentabilidadeRuralImportInputSchema.parse(row);

      const isImportHashExistent = await prisma.$withRLS(
        { organization: currentOrganization },
        async (tx) => {
          return Boolean(
            await tx.certificacaoSustentabilidadeRural.count({
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

      await certificacaoSustentabilidadeRuralCreate(row, context);

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

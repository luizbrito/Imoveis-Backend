import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  arquivoKmlAutocompleteInputSchema,
  arquivoKmlAutocompleteOutputSchema,
} from '../arquivoKmlSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/arquivo-kml/autocomplete',
  query: arquivoKmlAutocompleteInputSchema,
  response: z.array(arquivoKmlAutocompleteOutputSchema),
};

export const arquivoKmlAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'arquivoKml_autocomplete',
  description: dictionary.arquivoKml.mcpDescription.autocomplete,
  requiredPermissions: { arquivoKml: ['autocomplete'] },
  schema: toMcpJsonSchema(arquivoKmlAutocompleteInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlAutocompleteController(params, context);
  },
});

export async function arquivoKmlAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    arquivoKmlAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ArquivoKmlWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      whereAnd.push({ archivedAt: null });

      if (exclude) {
        whereAnd.push({
          id: {
            notIn: exclude,
          },
        });
      }

      if (search) {
        whereAnd.push({
          nome: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const arquivosKml = await tx.arquivoKml.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return arquivosKml.map((arquivoKml) => ({
        id: arquivoKml.id,
        nome: String(arquivoKml.nome),
      }));
    },
  );
}

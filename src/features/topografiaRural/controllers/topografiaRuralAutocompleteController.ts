import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  topografiaRuralAutocompleteInputSchema,
  topografiaRuralAutocompleteOutputSchema,
} from '../topografiaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const topografiaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/topografia-rural/autocomplete',
  query: topografiaRuralAutocompleteInputSchema,
  response: z.array(topografiaRuralAutocompleteOutputSchema),
};

export const topografiaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'topografiaRural_autocomplete',
  description: dictionary.topografiaRural.mcpDescription.autocomplete,
  requiredPermissions: { topografiaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(topografiaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await topografiaRuralAutocompleteController(params, context);
  },
});

export async function topografiaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      topografiaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    topografiaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TopografiaRuralWhereInput> = [];

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
          descricao: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const topografiasRurais = await tx.topografiaRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return topografiasRurais.map((topografiaRural) => ({
        id: topografiaRural.id,
        descricao: String(topografiaRural.descricao),
      }));
    },
  );
}

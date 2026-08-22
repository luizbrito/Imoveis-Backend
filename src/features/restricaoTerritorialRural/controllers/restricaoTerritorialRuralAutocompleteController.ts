import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  restricaoTerritorialRuralAutocompleteInputSchema,
  restricaoTerritorialRuralAutocompleteOutputSchema,
} from '../restricaoTerritorialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const restricaoTerritorialRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/restricao-territorial-rural/autocomplete',
  query: restricaoTerritorialRuralAutocompleteInputSchema,
  response: z.array(restricaoTerritorialRuralAutocompleteOutputSchema),
};

export const restricaoTerritorialRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'restricaoTerritorialRural_autocomplete',
  description: dictionary.restricaoTerritorialRural.mcpDescription.autocomplete,
  requiredPermissions: { restricaoTerritorialRural: ['autocomplete'] },
  schema: toMcpJsonSchema(restricaoTerritorialRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await restricaoTerritorialRuralAutocompleteController(
      params,
      context,
    );
  },
});

export async function restricaoTerritorialRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      restricaoTerritorialRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    restricaoTerritorialRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RestricaoTerritorialRuralWhereInput> = [];

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
          tipo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const restricoesTerritoriaisRurais =
        await tx.restricaoTerritorialRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return restricoesTerritoriaisRurais.map((restricaoTerritorialRural) => ({
        id: restricaoTerritorialRural.id,
        tipo: String(restricaoTerritorialRural.tipo),
      }));
    },
  );
}

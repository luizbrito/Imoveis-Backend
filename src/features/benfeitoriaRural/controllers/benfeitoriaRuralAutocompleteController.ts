import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  benfeitoriaRuralAutocompleteInputSchema,
  benfeitoriaRuralAutocompleteOutputSchema,
} from '../benfeitoriaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const benfeitoriaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/benfeitoria-rural/autocomplete',
  query: benfeitoriaRuralAutocompleteInputSchema,
  response: z.array(benfeitoriaRuralAutocompleteOutputSchema),
};

export const benfeitoriaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'benfeitoriaRural_autocomplete',
  description: dictionary.benfeitoriaRural.mcpDescription.autocomplete,
  requiredPermissions: { benfeitoriaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(benfeitoriaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await benfeitoriaRuralAutocompleteController(params, context);
  },
});

export async function benfeitoriaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      benfeitoriaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    benfeitoriaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.BenfeitoriaRuralWhereInput> = [];

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

      const benfeitoriasRurais = await tx.benfeitoriaRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return benfeitoriasRurais.map((benfeitoriaRural) => ({
        id: benfeitoriaRural.id,
        nome: String(benfeitoriaRural.nome),
      }));
    },
  );
}

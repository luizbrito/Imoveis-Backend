import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  pistaAviacaoRuralAutocompleteInputSchema,
  pistaAviacaoRuralAutocompleteOutputSchema,
} from '../pistaAviacaoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pista-aviacao-rural/autocomplete',
  query: pistaAviacaoRuralAutocompleteInputSchema,
  response: z.array(pistaAviacaoRuralAutocompleteOutputSchema),
};

export const pistaAviacaoRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_autocomplete',
  description: dictionary.pistaAviacaoRural.mcpDescription.autocomplete,
  requiredPermissions: { pistaAviacaoRural: ['autocomplete'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralAutocompleteController(params, context);
  },
});

export async function pistaAviacaoRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    pistaAviacaoRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PistaAviacaoRuralWhereInput> = [];

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

      const pistasAviacaoRurais = await tx.pistaAviacaoRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return pistasAviacaoRurais.map((pistaAviacaoRural) => ({
        id: pistaAviacaoRural.id,
        nome: String(pistaAviacaoRural.nome),
      }));
    },
  );
}

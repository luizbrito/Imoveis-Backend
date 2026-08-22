import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  riscoRuralAutocompleteInputSchema,
  riscoRuralAutocompleteOutputSchema,
} from '../riscoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const riscoRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/risco-rural/autocomplete',
  query: riscoRuralAutocompleteInputSchema,
  response: z.array(riscoRuralAutocompleteOutputSchema),
};

export const riscoRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'riscoRural_autocomplete',
  description: dictionary.riscoRural.mcpDescription.autocomplete,
  requiredPermissions: { riscoRural: ['autocomplete'] },
  schema: toMcpJsonSchema(riscoRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await riscoRuralAutocompleteController(params, context);
  },
});

export async function riscoRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      riscoRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    riscoRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RiscoRuralWhereInput> = [];

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

      const riscosRurais = await tx.riscoRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return riscosRurais.map((riscoRural) => ({
        id: riscoRural.id,
        tipo: String(riscoRural.tipo),
      }));
    },
  );
}

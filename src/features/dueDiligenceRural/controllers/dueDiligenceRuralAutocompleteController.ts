import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  dueDiligenceRuralAutocompleteInputSchema,
  dueDiligenceRuralAutocompleteOutputSchema,
} from '../dueDiligenceRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const dueDiligenceRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/due-diligence-rural/autocomplete',
  query: dueDiligenceRuralAutocompleteInputSchema,
  response: z.array(dueDiligenceRuralAutocompleteOutputSchema),
};

export const dueDiligenceRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'dueDiligenceRural_autocomplete',
  description: dictionary.dueDiligenceRural.mcpDescription.autocomplete,
  requiredPermissions: { dueDiligenceRural: ['autocomplete'] },
  schema: toMcpJsonSchema(dueDiligenceRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await dueDiligenceRuralAutocompleteController(params, context);
  },
});

export async function dueDiligenceRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      dueDiligenceRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    dueDiligenceRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DueDiligenceRuralWhereInput> = [];

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
          titulo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const dueDiligencesRurais = await tx.dueDiligenceRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return dueDiligencesRurais.map((dueDiligenceRural) => ({
        id: dueDiligenceRural.id,
        titulo: String(dueDiligenceRural.titulo),
      }));
    },
  );
}

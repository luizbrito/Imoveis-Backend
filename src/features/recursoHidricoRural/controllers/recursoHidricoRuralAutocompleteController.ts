import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  recursoHidricoRuralAutocompleteInputSchema,
  recursoHidricoRuralAutocompleteOutputSchema,
} from '../recursoHidricoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const recursoHidricoRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/recurso-hidrico-rural/autocomplete',
  query: recursoHidricoRuralAutocompleteInputSchema,
  response: z.array(recursoHidricoRuralAutocompleteOutputSchema),
};

export const recursoHidricoRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'recursoHidricoRural_autocomplete',
  description: dictionary.recursoHidricoRural.mcpDescription.autocomplete,
  requiredPermissions: { recursoHidricoRural: ['autocomplete'] },
  schema: toMcpJsonSchema(recursoHidricoRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await recursoHidricoRuralAutocompleteController(params, context);
  },
});

export async function recursoHidricoRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      recursoHidricoRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    recursoHidricoRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RecursoHidricoRuralWhereInput> = [];

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

      const recursosHidricosRurais = await tx.recursoHidricoRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return recursosHidricosRurais.map((recursoHidricoRural) => ({
        id: recursoHidricoRural.id,
        nome: String(recursoHidricoRural.nome),
      }));
    },
  );
}

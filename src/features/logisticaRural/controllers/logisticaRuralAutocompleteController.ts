import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  logisticaRuralAutocompleteInputSchema,
  logisticaRuralAutocompleteOutputSchema,
} from '../logisticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const logisticaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/logistica-rural/autocomplete',
  query: logisticaRuralAutocompleteInputSchema,
  response: z.array(logisticaRuralAutocompleteOutputSchema),
};

export const logisticaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'logisticaRural_autocomplete',
  description: dictionary.logisticaRural.mcpDescription.autocomplete,
  requiredPermissions: { logisticaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(logisticaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await logisticaRuralAutocompleteController(params, context);
  },
});

export async function logisticaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      logisticaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    logisticaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LogisticaRuralWhereInput> = [];

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

      const logisticasRurais = await tx.logisticaRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return logisticasRurais.map((logisticaRural) => ({
        id: logisticaRural.id,
        descricao: String(logisticaRural.descricao),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  divisaoOperacionalRuralAutocompleteInputSchema,
  divisaoOperacionalRuralAutocompleteOutputSchema,
} from '../divisaoOperacionalRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/divisao-operacional-rural/autocomplete',
  query: divisaoOperacionalRuralAutocompleteInputSchema,
  response: z.array(divisaoOperacionalRuralAutocompleteOutputSchema),
};

export const divisaoOperacionalRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_autocomplete',
  description: dictionary.divisaoOperacionalRural.mcpDescription.autocomplete,
  requiredPermissions: { divisaoOperacionalRural: ['autocomplete'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralAutocompleteController(params, context);
  },
});

export async function divisaoOperacionalRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    divisaoOperacionalRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DivisaoOperacionalRuralWhereInput> = [];

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

      const divisoesOperacionaisRurais =
        await tx.divisaoOperacionalRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return divisoesOperacionaisRurais.map((divisaoOperacionalRural) => ({
        id: divisaoOperacionalRural.id,
        nome: String(divisaoOperacionalRural.nome),
      }));
    },
  );
}

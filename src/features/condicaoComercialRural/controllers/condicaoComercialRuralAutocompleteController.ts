import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  condicaoComercialRuralAutocompleteInputSchema,
  condicaoComercialRuralAutocompleteOutputSchema,
} from '../condicaoComercialRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoComercialRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-comercial-rural/autocomplete',
  query: condicaoComercialRuralAutocompleteInputSchema,
  response: z.array(condicaoComercialRuralAutocompleteOutputSchema),
};

export const condicaoComercialRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoComercialRural_autocomplete',
  description: dictionary.condicaoComercialRural.mcpDescription.autocomplete,
  requiredPermissions: { condicaoComercialRural: ['autocomplete'] },
  schema: toMcpJsonSchema(condicaoComercialRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await condicaoComercialRuralAutocompleteController(params, context);
  },
});

export async function condicaoComercialRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoComercialRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    condicaoComercialRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondicaoComercialRuralWhereInput> = [];

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
          precoPorHa: parseFloat(search),
        });
      }

      const condicoesComerciaisRurais =
        await tx.condicaoComercialRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return condicoesComerciaisRurais.map((condicaoComercialRural) => ({
        id: condicaoComercialRural.id,
        precoPorHa: String(condicaoComercialRural.precoPorHa),
      }));
    },
  );
}

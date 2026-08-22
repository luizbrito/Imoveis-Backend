import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  paisAutocompleteInputSchema,
  paisAutocompleteOutputSchema,
} from '../paisSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pais/autocomplete',
  query: paisAutocompleteInputSchema,
  response: z.array(paisAutocompleteOutputSchema),
};

export const paisAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_autocomplete',
  description: dictionary.pais.mcpDescription.autocomplete,
  requiredPermissions: { pais: ['autocomplete'] },
  schema: toMcpJsonSchema(paisAutocompleteInputSchema),
  handler: async (params, context) => {
    return await paisAutocompleteController(params, context);
  },
});

export async function paisAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pais: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    paisAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PaisWhereInput> = [];

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

      const paiss = await tx.pais.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return paiss.map((pais) => ({
        id: pais.id,
        nome: String(pais.nome),
      }));
    },
  );
}

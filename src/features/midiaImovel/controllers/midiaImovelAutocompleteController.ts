import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  midiaImovelAutocompleteInputSchema,
  midiaImovelAutocompleteOutputSchema,
} from '../midiaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const midiaImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/midia-imovel/autocomplete',
  query: midiaImovelAutocompleteInputSchema,
  response: z.array(midiaImovelAutocompleteOutputSchema),
};

export const midiaImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'midiaImovel_autocomplete',
  description: dictionary.midiaImovel.mcpDescription.autocomplete,
  requiredPermissions: { midiaImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(midiaImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await midiaImovelAutocompleteController(params, context);
  },
});

export async function midiaImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      midiaImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    midiaImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.MidiaImovelWhereInput> = [];

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

      const midiasImovel = await tx.midiaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return midiasImovel.map((midiaImovel) => ({
        id: midiaImovel.id,
        titulo: String(midiaImovel.titulo),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  anuncioAutocompleteInputSchema,
  anuncioAutocompleteOutputSchema,
} from '../anuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/anuncio/autocomplete',
  query: anuncioAutocompleteInputSchema,
  response: z.array(anuncioAutocompleteOutputSchema),
};

export const anuncioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'anuncio_autocomplete',
  description: dictionary.anuncio.mcpDescription.autocomplete,
  requiredPermissions: { anuncio: ['autocomplete'] },
  schema: toMcpJsonSchema(anuncioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await anuncioAutocompleteController(params, context);
  },
});

export async function anuncioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    anuncioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AnuncioWhereInput> = [];

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

      const anuncios = await tx.anuncio.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return anuncios.map((anuncio) => ({
        id: anuncio.id,
        titulo: String(anuncio.titulo),
      }));
    },
  );
}

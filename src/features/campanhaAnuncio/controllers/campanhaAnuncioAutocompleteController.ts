import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  campanhaAnuncioAutocompleteInputSchema,
  campanhaAnuncioAutocompleteOutputSchema,
} from '../campanhaAnuncioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaAnuncioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-anuncio/autocomplete',
  query: campanhaAnuncioAutocompleteInputSchema,
  response: z.array(campanhaAnuncioAutocompleteOutputSchema),
};

export const campanhaAnuncioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaAnuncio_autocomplete',
  description: dictionary.campanhaAnuncio.mcpDescription.autocomplete,
  requiredPermissions: { campanhaAnuncio: ['autocomplete'] },
  schema: toMcpJsonSchema(campanhaAnuncioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await campanhaAnuncioAutocompleteController(params, context);
  },
});

export async function campanhaAnuncioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaAnuncio: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    campanhaAnuncioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CampanhaAnuncioWhereInput> = [];

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
          dataInclusao: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const campanhasAnuncios = await tx.campanhaAnuncio.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return campanhasAnuncios.map((campanhaAnuncio) => ({
        id: campanhaAnuncio.id,
        dataInclusao: String(campanhaAnuncio.dataInclusao),
      }));
    },
  );
}

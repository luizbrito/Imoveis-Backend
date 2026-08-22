import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  favoritoClienteAutocompleteInputSchema,
  favoritoClienteAutocompleteOutputSchema,
} from '../favoritoClienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const favoritoClienteAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/favorito-cliente/autocomplete',
  query: favoritoClienteAutocompleteInputSchema,
  response: z.array(favoritoClienteAutocompleteOutputSchema),
};

export const favoritoClienteAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'favoritoCliente_autocomplete',
  description: dictionary.favoritoCliente.mcpDescription.autocomplete,
  requiredPermissions: { favoritoCliente: ['autocomplete'] },
  schema: toMcpJsonSchema(favoritoClienteAutocompleteInputSchema),
  handler: async (params, context) => {
    return await favoritoClienteAutocompleteController(params, context);
  },
});

export async function favoritoClienteAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      favoritoCliente: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    favoritoClienteAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FavoritoClienteWhereInput> = [];

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
            gte: new Date(search),
          },
        });
      }

      const favoritosCliente = await tx.favoritoCliente.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return favoritosCliente.map((favoritoCliente) => ({
        id: favoritoCliente.id,
        dataInclusao: String(favoritoCliente.dataInclusao),
      }));
    },
  );
}

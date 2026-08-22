import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  reservaImovelAutocompleteInputSchema,
  reservaImovelAutocompleteOutputSchema,
} from '../reservaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reserva-imovel/autocomplete',
  query: reservaImovelAutocompleteInputSchema,
  response: z.array(reservaImovelAutocompleteOutputSchema),
};

export const reservaImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_autocomplete',
  description: dictionary.reservaImovel.mcpDescription.autocomplete,
  requiredPermissions: { reservaImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(reservaImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await reservaImovelAutocompleteController(params, context);
  },
});

export async function reservaImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reservaImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    reservaImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReservaImovelWhereInput> = [];

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
          codigo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const reservasImovel = await tx.reservaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return reservasImovel.map((reservaImovel) => ({
        id: reservaImovel.id,
        codigo: String(reservaImovel.codigo),
      }));
    },
  );
}

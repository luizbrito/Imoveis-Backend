import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  caracteristicaImovelAutocompleteInputSchema,
  caracteristicaImovelAutocompleteOutputSchema,
} from '../caracteristicaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const caracteristicaImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/caracteristica-imovel/autocomplete',
  query: caracteristicaImovelAutocompleteInputSchema,
  response: z.array(caracteristicaImovelAutocompleteOutputSchema),
};

export const caracteristicaImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'caracteristicaImovel_autocomplete',
  description: dictionary.caracteristicaImovel.mcpDescription.autocomplete,
  requiredPermissions: { caracteristicaImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(caracteristicaImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await caracteristicaImovelAutocompleteController(params, context);
  },
});

export async function caracteristicaImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      caracteristicaImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    caracteristicaImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CaracteristicaImovelWhereInput> = [];

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

      const caracteristicasImovel = await tx.caracteristicaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return caracteristicasImovel.map((caracteristicaImovel) => ({
        id: caracteristicaImovel.id,
        nome: String(caracteristicaImovel.nome),
      }));
    },
  );
}

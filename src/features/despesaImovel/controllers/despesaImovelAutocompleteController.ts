import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  despesaImovelAutocompleteInputSchema,
  despesaImovelAutocompleteOutputSchema,
} from '../despesaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const despesaImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/despesa-imovel/autocomplete',
  query: despesaImovelAutocompleteInputSchema,
  response: z.array(despesaImovelAutocompleteOutputSchema),
};

export const despesaImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'despesaImovel_autocomplete',
  description: dictionary.despesaImovel.mcpDescription.autocomplete,
  requiredPermissions: { despesaImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(despesaImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await despesaImovelAutocompleteController(params, context);
  },
});

export async function despesaImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      despesaImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    despesaImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DespesaImovelWhereInput> = [];

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

      const despesasImovel = await tx.despesaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return despesasImovel.map((despesaImovel) => ({
        id: despesaImovel.id,
        descricao: String(despesaImovel.descricao),
      }));
    },
  );
}

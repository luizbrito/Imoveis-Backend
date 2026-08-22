import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  vendaAutocompleteInputSchema,
  vendaAutocompleteOutputSchema,
} from '../vendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/venda/autocomplete',
  query: vendaAutocompleteInputSchema,
  response: z.array(vendaAutocompleteOutputSchema),
};

export const vendaAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_autocomplete',
  description: dictionary.venda.mcpDescription.autocomplete,
  requiredPermissions: { venda: ['autocomplete'] },
  schema: toMcpJsonSchema(vendaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await vendaAutocompleteController(params, context);
  },
});

export async function vendaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    vendaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VendaWhereInput> = [];

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

      const vendas = await tx.venda.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return vendas.map((venda) => ({
        id: venda.id,
        codigo: String(venda.codigo),
      }));
    },
  );
}

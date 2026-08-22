import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  itemVistoriaAutocompleteInputSchema,
  itemVistoriaAutocompleteOutputSchema,
} from '../itemVistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const itemVistoriaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/item-vistoria/autocomplete',
  query: itemVistoriaAutocompleteInputSchema,
  response: z.array(itemVistoriaAutocompleteOutputSchema),
};

export const itemVistoriaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'itemVistoria_autocomplete',
  description: dictionary.itemVistoria.mcpDescription.autocomplete,
  requiredPermissions: { itemVistoria: ['autocomplete'] },
  schema: toMcpJsonSchema(itemVistoriaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await itemVistoriaAutocompleteController(params, context);
  },
});

export async function itemVistoriaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      itemVistoria: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    itemVistoriaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ItemVistoriaWhereInput> = [];

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
          item: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const itensVistoria = await tx.itemVistoria.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return itensVistoria.map((itemVistoria) => ({
        id: itemVistoria.id,
        item: String(itemVistoria.item),
      }));
    },
  );
}

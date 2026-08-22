import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  categoriaFinanceiraAutocompleteInputSchema,
  categoriaFinanceiraAutocompleteOutputSchema,
} from '../categoriaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const categoriaFinanceiraAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/categoria-financeira/autocomplete',
  query: categoriaFinanceiraAutocompleteInputSchema,
  response: z.array(categoriaFinanceiraAutocompleteOutputSchema),
};

export const categoriaFinanceiraAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'categoriaFinanceira_autocomplete',
  description: dictionary.categoriaFinanceira.mcpDescription.autocomplete,
  requiredPermissions: { categoriaFinanceira: ['autocomplete'] },
  schema: toMcpJsonSchema(categoriaFinanceiraAutocompleteInputSchema),
  handler: async (params, context) => {
    return await categoriaFinanceiraAutocompleteController(params, context);
  },
});

export async function categoriaFinanceiraAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      categoriaFinanceira: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    categoriaFinanceiraAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CategoriaFinanceiraWhereInput> = [];

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

      const categoriasFinanceiras = await tx.categoriaFinanceira.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return categoriasFinanceiras.map((categoriaFinanceira) => ({
        id: categoriaFinanceira.id,
        nome: String(categoriaFinanceira.nome),
      }));
    },
  );
}

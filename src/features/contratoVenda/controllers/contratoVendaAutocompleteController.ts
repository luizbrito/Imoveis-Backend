import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  contratoVendaAutocompleteInputSchema,
  contratoVendaAutocompleteOutputSchema,
} from '../contratoVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-venda/autocomplete',
  query: contratoVendaAutocompleteInputSchema,
  response: z.array(contratoVendaAutocompleteOutputSchema),
};

export const contratoVendaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_autocomplete',
  description: dictionary.contratoVenda.mcpDescription.autocomplete,
  requiredPermissions: { contratoVenda: ['autocomplete'] },
  schema: toMcpJsonSchema(contratoVendaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await contratoVendaAutocompleteController(params, context);
  },
});

export async function contratoVendaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoVenda: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    contratoVendaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoVendaWhereInput> = [];

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
          numero: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const contratosVenda = await tx.contratoVenda.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return contratosVenda.map((contratoVenda) => ({
        id: contratoVenda.id,
        numero: String(contratoVenda.numero),
      }));
    },
  );
}

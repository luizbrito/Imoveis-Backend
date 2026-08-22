import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  parcelaVendaAutocompleteInputSchema,
  parcelaVendaAutocompleteOutputSchema,
} from '../parcelaVendaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const parcelaVendaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/parcela-venda/autocomplete',
  query: parcelaVendaAutocompleteInputSchema,
  response: z.array(parcelaVendaAutocompleteOutputSchema),
};

export const parcelaVendaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'parcelaVenda_autocomplete',
  description: dictionary.parcelaVenda.mcpDescription.autocomplete,
  requiredPermissions: { parcelaVenda: ['autocomplete'] },
  schema: toMcpJsonSchema(parcelaVendaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await parcelaVendaAutocompleteController(params, context);
  },
});

export async function parcelaVendaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      parcelaVenda: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    parcelaVendaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ParcelaVendaWhereInput> = [];

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
          numeroParcela: parseInt(search),
        });
      }

      const parcelasVenda = await tx.parcelaVenda.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return parcelasVenda.map((parcelaVenda) => ({
        id: parcelaVenda.id,
        numeroParcela: String(parcelaVenda.numeroParcela),
      }));
    },
  );
}

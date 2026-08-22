import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  clienteAutocompleteInputSchema,
  clienteAutocompleteOutputSchema,
} from '../clienteSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cliente/autocomplete',
  query: clienteAutocompleteInputSchema,
  response: z.array(clienteAutocompleteOutputSchema),
};

export const clienteAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cliente_autocomplete',
  description: dictionary.cliente.mcpDescription.autocomplete,
  requiredPermissions: { cliente: ['autocomplete'] },
  schema: toMcpJsonSchema(clienteAutocompleteInputSchema),
  handler: async (params, context) => {
    return await clienteAutocompleteController(params, context);
  },
});

export async function clienteAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    clienteAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ClienteWhereInput> = [];

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
          nomeRazaoSocial: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const clientes = await tx.cliente.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return clientes.map((cliente) => ({
        id: cliente.id,
        nomeRazaoSocial: String(cliente.nomeRazaoSocial),
      }));
    },
  );
}

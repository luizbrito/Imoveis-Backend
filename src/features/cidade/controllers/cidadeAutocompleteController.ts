import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  cidadeAutocompleteInputSchema,
  cidadeAutocompleteOutputSchema,
} from '../cidadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cidade/autocomplete',
  query: cidadeAutocompleteInputSchema,
  response: z.array(cidadeAutocompleteOutputSchema),
};

export const cidadeAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_autocomplete',
  description: dictionary.cidade.mcpDescription.autocomplete,
  requiredPermissions: { cidade: ['autocomplete'] },
  schema: toMcpJsonSchema(cidadeAutocompleteInputSchema),
  handler: async (params, context) => {
    return await cidadeAutocompleteController(params, context);
  },
});

export async function cidadeAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    cidadeAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CidadeWhereInput> = [];

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

      const cidades = await tx.cidade.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return cidades.map((cidade) => ({
        id: cidade.id,
        nome: String(cidade.nome),
      }));
    },
  );
}

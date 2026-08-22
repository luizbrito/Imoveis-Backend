import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  chaveImovelAutocompleteInputSchema,
  chaveImovelAutocompleteOutputSchema,
} from '../chaveImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const chaveImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chave-imovel/autocomplete',
  query: chaveImovelAutocompleteInputSchema,
  response: z.array(chaveImovelAutocompleteOutputSchema),
};

export const chaveImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'chaveImovel_autocomplete',
  description: dictionary.chaveImovel.mcpDescription.autocomplete,
  requiredPermissions: { chaveImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(chaveImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await chaveImovelAutocompleteController(params, context);
  },
});

export async function chaveImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      chaveImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    chaveImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ChaveImovelWhereInput> = [];

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

      const chavesImovel = await tx.chaveImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return chavesImovel.map((chaveImovel) => ({
        id: chaveImovel.id,
        codigo: String(chaveImovel.codigo),
      }));
    },
  );
}

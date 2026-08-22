import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  corretorAutocompleteInputSchema,
  corretorAutocompleteOutputSchema,
} from '../corretorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/corretor/autocomplete',
  query: corretorAutocompleteInputSchema,
  response: z.array(corretorAutocompleteOutputSchema),
};

export const corretorAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'corretor_autocomplete',
  description: dictionary.corretor.mcpDescription.autocomplete,
  requiredPermissions: { corretor: ['autocomplete'] },
  schema: toMcpJsonSchema(corretorAutocompleteInputSchema),
  handler: async (params, context) => {
    return await corretorAutocompleteController(params, context);
  },
});

export async function corretorAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    corretorAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CorretorWhereInput> = [];

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
          nomeCompleto: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const corretores = await tx.corretor.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return corretores.map((corretor) => ({
        id: corretor.id,
        nomeCompleto: String(corretor.nomeCompleto),
      }));
    },
  );
}

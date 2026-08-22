import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  proprietarioAutocompleteInputSchema,
  proprietarioAutocompleteOutputSchema,
} from '../proprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proprietario/autocomplete',
  query: proprietarioAutocompleteInputSchema,
  response: z.array(proprietarioAutocompleteOutputSchema),
};

export const proprietarioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proprietario_autocomplete',
  description: dictionary.proprietario.mcpDescription.autocomplete,
  requiredPermissions: { proprietario: ['autocomplete'] },
  schema: toMcpJsonSchema(proprietarioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await proprietarioAutocompleteController(params, context);
  },
});

export async function proprietarioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    proprietarioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ProprietarioWhereInput> = [];

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

      const proprietarios = await tx.proprietario.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return proprietarios.map((proprietario) => ({
        id: proprietario.id,
        nomeRazaoSocial: String(proprietario.nomeRazaoSocial),
      }));
    },
  );
}

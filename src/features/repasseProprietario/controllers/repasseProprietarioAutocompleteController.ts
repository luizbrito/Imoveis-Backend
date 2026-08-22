import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  repasseProprietarioAutocompleteInputSchema,
  repasseProprietarioAutocompleteOutputSchema,
} from '../repasseProprietarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/repasse-proprietario/autocomplete',
  query: repasseProprietarioAutocompleteInputSchema,
  response: z.array(repasseProprietarioAutocompleteOutputSchema),
};

export const repasseProprietarioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_autocomplete',
  description: dictionary.repasseProprietario.mcpDescription.autocomplete,
  requiredPermissions: { repasseProprietario: ['autocomplete'] },
  schema: toMcpJsonSchema(repasseProprietarioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioAutocompleteController(params, context);
  },
});

export async function repasseProprietarioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      repasseProprietario: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    repasseProprietarioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.RepasseProprietarioWhereInput> = [];

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
          competencia: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const repassesProprietario = await tx.repasseProprietario.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return repassesProprietario.map((repasseProprietario) => ({
        id: repasseProprietario.id,
        competencia: String(repasseProprietario.competencia),
      }));
    },
  );
}

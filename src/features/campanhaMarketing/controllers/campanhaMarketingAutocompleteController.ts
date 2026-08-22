import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  campanhaMarketingAutocompleteInputSchema,
  campanhaMarketingAutocompleteOutputSchema,
} from '../campanhaMarketingSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const campanhaMarketingAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/campanha-marketing/autocomplete',
  query: campanhaMarketingAutocompleteInputSchema,
  response: z.array(campanhaMarketingAutocompleteOutputSchema),
};

export const campanhaMarketingAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'campanhaMarketing_autocomplete',
  description: dictionary.campanhaMarketing.mcpDescription.autocomplete,
  requiredPermissions: { campanhaMarketing: ['autocomplete'] },
  schema: toMcpJsonSchema(campanhaMarketingAutocompleteInputSchema),
  handler: async (params, context) => {
    return await campanhaMarketingAutocompleteController(params, context);
  },
});

export async function campanhaMarketingAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      campanhaMarketing: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    campanhaMarketingAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CampanhaMarketingWhereInput> = [];

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

      const campanhasMarketing = await tx.campanhaMarketing.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return campanhasMarketing.map((campanhaMarketing) => ({
        id: campanhaMarketing.id,
        nome: String(campanhaMarketing.nome),
      }));
    },
  );
}

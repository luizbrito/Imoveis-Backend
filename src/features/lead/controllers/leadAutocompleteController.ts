import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  leadAutocompleteInputSchema,
  leadAutocompleteOutputSchema,
} from '../leadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lead/autocomplete',
  query: leadAutocompleteInputSchema,
  response: z.array(leadAutocompleteOutputSchema),
};

export const leadAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_autocomplete',
  description: dictionary.lead.mcpDescription.autocomplete,
  requiredPermissions: { lead: ['autocomplete'] },
  schema: toMcpJsonSchema(leadAutocompleteInputSchema),
  handler: async (params, context) => {
    return await leadAutocompleteController(params, context);
  },
});

export async function leadAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    leadAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LeadWhereInput> = [];

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

      const leads = await tx.lead.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return leads.map((lead) => ({
        id: lead.id,
        nome: String(lead.nome),
      }));
    },
  );
}

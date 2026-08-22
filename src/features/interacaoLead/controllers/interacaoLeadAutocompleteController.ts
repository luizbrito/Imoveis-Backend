import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  interacaoLeadAutocompleteInputSchema,
  interacaoLeadAutocompleteOutputSchema,
} from '../interacaoLeadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/interacao-lead/autocomplete',
  query: interacaoLeadAutocompleteInputSchema,
  response: z.array(interacaoLeadAutocompleteOutputSchema),
};

export const interacaoLeadAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'interacaoLead_autocomplete',
  description: dictionary.interacaoLead.mcpDescription.autocomplete,
  requiredPermissions: { interacaoLead: ['autocomplete'] },
  schema: toMcpJsonSchema(interacaoLeadAutocompleteInputSchema),
  handler: async (params, context) => {
    return await interacaoLeadAutocompleteController(params, context);
  },
});

export async function interacaoLeadAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    interacaoLeadAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.InteracaoLeadWhereInput> = [];

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
          assunto: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const interacoesLead = await tx.interacaoLead.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return interacoesLead.map((interacaoLead) => ({
        id: interacaoLead.id,
        assunto: String(interacaoLead.assunto),
      }));
    },
  );
}

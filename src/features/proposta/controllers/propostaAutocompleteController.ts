import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  propostaAutocompleteInputSchema,
  propostaAutocompleteOutputSchema,
} from '../propostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/proposta/autocomplete',
  query: propostaAutocompleteInputSchema,
  response: z.array(propostaAutocompleteOutputSchema),
};

export const propostaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'proposta_autocomplete',
  description: dictionary.proposta.mcpDescription.autocomplete,
  requiredPermissions: { proposta: ['autocomplete'] },
  schema: toMcpJsonSchema(propostaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await propostaAutocompleteController(params, context);
  },
});

export async function propostaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proposta: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    propostaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PropostaWhereInput> = [];

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

      const propostas = await tx.proposta.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return propostas.map((proposta) => ({
        id: proposta.id,
        codigo: String(proposta.codigo),
      }));
    },
  );
}

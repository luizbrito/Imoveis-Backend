import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  condicaoPropostaAutocompleteInputSchema,
  condicaoPropostaAutocompleteOutputSchema,
} from '../condicaoPropostaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condicao-proposta/autocomplete',
  query: condicaoPropostaAutocompleteInputSchema,
  response: z.array(condicaoPropostaAutocompleteOutputSchema),
};

export const condicaoPropostaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_autocomplete',
  description: dictionary.condicaoProposta.mcpDescription.autocomplete,
  requiredPermissions: { condicaoProposta: ['autocomplete'] },
  schema: toMcpJsonSchema(condicaoPropostaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaAutocompleteController(params, context);
  },
});

export async function condicaoPropostaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    condicaoPropostaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondicaoPropostaWhereInput> = [];

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
          descricao: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const condicoesProposta = await tx.condicaoProposta.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return condicoesProposta.map((condicaoProposta) => ({
        id: condicaoProposta.id,
        descricao: String(condicaoProposta.descricao),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  locacaoAutocompleteInputSchema,
  locacaoAutocompleteOutputSchema,
} from '../locacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/locacao/autocomplete',
  query: locacaoAutocompleteInputSchema,
  response: z.array(locacaoAutocompleteOutputSchema),
};

export const locacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'locacao_autocomplete',
  description: dictionary.locacao.mcpDescription.autocomplete,
  requiredPermissions: { locacao: ['autocomplete'] },
  schema: toMcpJsonSchema(locacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await locacaoAutocompleteController(params, context);
  },
});

export async function locacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    locacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LocacaoWhereInput> = [];

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

      const locacoes = await tx.locacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return locacoes.map((locacao) => ({
        id: locacao.id,
        codigo: String(locacao.codigo),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  avaliacaoImovelAutocompleteInputSchema,
  avaliacaoImovelAutocompleteOutputSchema,
} from '../avaliacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const avaliacaoImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/avaliacao-imovel/autocomplete',
  query: avaliacaoImovelAutocompleteInputSchema,
  response: z.array(avaliacaoImovelAutocompleteOutputSchema),
};

export const avaliacaoImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'avaliacaoImovel_autocomplete',
  description: dictionary.avaliacaoImovel.mcpDescription.autocomplete,
  requiredPermissions: { avaliacaoImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(avaliacaoImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await avaliacaoImovelAutocompleteController(params, context);
  },
});

export async function avaliacaoImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      avaliacaoImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    avaliacaoImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AvaliacaoImovelWhereInput> = [];

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

      const avaliacoesImovel = await tx.avaliacaoImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return avaliacoesImovel.map((avaliacaoImovel) => ({
        id: avaliacaoImovel.id,
        codigo: String(avaliacaoImovel.codigo),
      }));
    },
  );
}

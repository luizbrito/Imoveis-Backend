import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  captacaoImovelAutocompleteInputSchema,
  captacaoImovelAutocompleteOutputSchema,
} from '../captacaoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/captacao-imovel/autocomplete',
  query: captacaoImovelAutocompleteInputSchema,
  response: z.array(captacaoImovelAutocompleteOutputSchema),
};

export const captacaoImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_autocomplete',
  description: dictionary.captacaoImovel.mcpDescription.autocomplete,
  requiredPermissions: { captacaoImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(captacaoImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelAutocompleteController(params, context);
  },
});

export async function captacaoImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      captacaoImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    captacaoImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CaptacaoImovelWhereInput> = [];

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

      const captacoesImovel = await tx.captacaoImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return captacoesImovel.map((captacaoImovel) => ({
        id: captacaoImovel.id,
        codigo: String(captacaoImovel.codigo),
      }));
    },
  );
}

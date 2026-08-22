import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  comissaoAutocompleteInputSchema,
  comissaoAutocompleteOutputSchema,
} from '../comissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const comissaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/comissao/autocomplete',
  query: comissaoAutocompleteInputSchema,
  response: z.array(comissaoAutocompleteOutputSchema),
};

export const comissaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'comissao_autocomplete',
  description: dictionary.comissao.mcpDescription.autocomplete,
  requiredPermissions: { comissao: ['autocomplete'] },
  schema: toMcpJsonSchema(comissaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await comissaoAutocompleteController(params, context);
  },
});

export async function comissaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      comissao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    comissaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ComissaoWhereInput> = [];

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

      const comissoes = await tx.comissao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return comissoes.map((comissao) => ({
        id: comissao.id,
        codigo: String(comissao.codigo),
      }));
    },
  );
}

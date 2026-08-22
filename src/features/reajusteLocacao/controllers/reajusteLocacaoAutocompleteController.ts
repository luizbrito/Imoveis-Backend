import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  reajusteLocacaoAutocompleteInputSchema,
  reajusteLocacaoAutocompleteOutputSchema,
} from '../reajusteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reajusteLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/reajuste-locacao/autocomplete',
  query: reajusteLocacaoAutocompleteInputSchema,
  response: z.array(reajusteLocacaoAutocompleteOutputSchema),
};

export const reajusteLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reajusteLocacao_autocomplete',
  description: dictionary.reajusteLocacao.mcpDescription.autocomplete,
  requiredPermissions: { reajusteLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(reajusteLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await reajusteLocacaoAutocompleteController(params, context);
  },
});

export async function reajusteLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      reajusteLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    reajusteLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReajusteLocacaoWhereInput> = [];

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
          dataBase: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const reajustesLocacao = await tx.reajusteLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return reajustesLocacao.map((reajusteLocacao) => ({
        id: reajusteLocacao.id,
        dataBase: String(reajusteLocacao.dataBase),
      }));
    },
  );
}

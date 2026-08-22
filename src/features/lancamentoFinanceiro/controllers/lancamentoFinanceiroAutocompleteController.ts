import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  lancamentoFinanceiroAutocompleteInputSchema,
  lancamentoFinanceiroAutocompleteOutputSchema,
} from '../lancamentoFinanceiroSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const lancamentoFinanceiroAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/lancamento-financeiro/autocomplete',
  query: lancamentoFinanceiroAutocompleteInputSchema,
  response: z.array(lancamentoFinanceiroAutocompleteOutputSchema),
};

export const lancamentoFinanceiroAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'lancamentoFinanceiro_autocomplete',
  description: dictionary.lancamentoFinanceiro.mcpDescription.autocomplete,
  requiredPermissions: { lancamentoFinanceiro: ['autocomplete'] },
  schema: toMcpJsonSchema(lancamentoFinanceiroAutocompleteInputSchema),
  handler: async (params, context) => {
    return await lancamentoFinanceiroAutocompleteController(params, context);
  },
});

export async function lancamentoFinanceiroAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lancamentoFinanceiro: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    lancamentoFinanceiroAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.LancamentoFinanceiroWhereInput> = [];

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

      const lancamentosFinanceiros = await tx.lancamentoFinanceiro.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return lancamentosFinanceiros.map((lancamentoFinanceiro) => ({
        id: lancamentoFinanceiro.id,
        descricao: String(lancamentoFinanceiro.descricao),
      }));
    },
  );
}

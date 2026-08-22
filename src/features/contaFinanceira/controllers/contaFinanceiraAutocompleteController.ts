import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  contaFinanceiraAutocompleteInputSchema,
  contaFinanceiraAutocompleteOutputSchema,
} from '../contaFinanceiraSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contaFinanceiraAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/conta-financeira/autocomplete',
  query: contaFinanceiraAutocompleteInputSchema,
  response: z.array(contaFinanceiraAutocompleteOutputSchema),
};

export const contaFinanceiraAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contaFinanceira_autocomplete',
  description: dictionary.contaFinanceira.mcpDescription.autocomplete,
  requiredPermissions: { contaFinanceira: ['autocomplete'] },
  schema: toMcpJsonSchema(contaFinanceiraAutocompleteInputSchema),
  handler: async (params, context) => {
    return await contaFinanceiraAutocompleteController(params, context);
  },
});

export async function contaFinanceiraAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contaFinanceira: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    contaFinanceiraAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContaFinanceiraWhereInput> = [];

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

      const contasFinanceiras = await tx.contaFinanceira.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return contasFinanceiras.map((contaFinanceira) => ({
        id: contaFinanceira.id,
        nome: String(contaFinanceira.nome),
      }));
    },
  );
}

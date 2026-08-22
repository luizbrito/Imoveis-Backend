import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  pagamentoComissaoAutocompleteInputSchema,
  pagamentoComissaoAutocompleteOutputSchema,
} from '../pagamentoComissaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoComissaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-comissao/autocomplete',
  query: pagamentoComissaoAutocompleteInputSchema,
  response: z.array(pagamentoComissaoAutocompleteOutputSchema),
};

export const pagamentoComissaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoComissao_autocomplete',
  description: dictionary.pagamentoComissao.mcpDescription.autocomplete,
  requiredPermissions: { pagamentoComissao: ['autocomplete'] },
  schema: toMcpJsonSchema(pagamentoComissaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await pagamentoComissaoAutocompleteController(params, context);
  },
});

export async function pagamentoComissaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoComissao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    pagamentoComissaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PagamentoComissaoWhereInput> = [];

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
          dataPagamento: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const pagamentosComissao = await tx.pagamentoComissao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return pagamentosComissao.map((pagamentoComissao) => ({
        id: pagamentoComissao.id,
        dataPagamento: String(pagamentoComissao.dataPagamento),
      }));
    },
  );
}

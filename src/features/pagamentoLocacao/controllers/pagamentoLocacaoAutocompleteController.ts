import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  pagamentoLocacaoAutocompleteInputSchema,
  pagamentoLocacaoAutocompleteOutputSchema,
} from '../pagamentoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pagamentoLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pagamento-locacao/autocomplete',
  query: pagamentoLocacaoAutocompleteInputSchema,
  response: z.array(pagamentoLocacaoAutocompleteOutputSchema),
};

export const pagamentoLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pagamentoLocacao_autocomplete',
  description: dictionary.pagamentoLocacao.mcpDescription.autocomplete,
  requiredPermissions: { pagamentoLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(pagamentoLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await pagamentoLocacaoAutocompleteController(params, context);
  },
});

export async function pagamentoLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pagamentoLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    pagamentoLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PagamentoLocacaoWhereInput> = [];

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
          identificadorTransacao: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const pagamentosLocacao = await tx.pagamentoLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return pagamentosLocacao.map((pagamentoLocacao) => ({
        id: pagamentoLocacao.id,
        identificadorTransacao: String(pagamentoLocacao.identificadorTransacao),
      }));
    },
  );
}

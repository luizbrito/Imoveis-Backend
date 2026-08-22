import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  cobrancaLocacaoAutocompleteInputSchema,
  cobrancaLocacaoAutocompleteOutputSchema,
} from '../cobrancaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cobrancaLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cobranca-locacao/autocomplete',
  query: cobrancaLocacaoAutocompleteInputSchema,
  response: z.array(cobrancaLocacaoAutocompleteOutputSchema),
};

export const cobrancaLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'cobrancaLocacao_autocomplete',
  description: dictionary.cobrancaLocacao.mcpDescription.autocomplete,
  requiredPermissions: { cobrancaLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(cobrancaLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await cobrancaLocacaoAutocompleteController(params, context);
  },
});

export async function cobrancaLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cobrancaLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    cobrancaLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CobrancaLocacaoWhereInput> = [];

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
          competencia: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const cobrancasLocacao = await tx.cobrancaLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return cobrancasLocacao.map((cobrancaLocacao) => ({
        id: cobrancaLocacao.id,
        competencia: String(cobrancaLocacao.competencia),
      }));
    },
  );
}

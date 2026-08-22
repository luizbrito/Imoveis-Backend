import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  solicitacaoManutencaoAutocompleteInputSchema,
  solicitacaoManutencaoAutocompleteOutputSchema,
} from '../solicitacaoManutencaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-manutencao/autocomplete',
  query: solicitacaoManutencaoAutocompleteInputSchema,
  response: z.array(solicitacaoManutencaoAutocompleteOutputSchema),
};

export const solicitacaoManutencaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_autocomplete',
  description: dictionary.solicitacaoManutencao.mcpDescription.autocomplete,
  requiredPermissions: { solicitacaoManutencao: ['autocomplete'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoAutocompleteController(params, context);
  },
});

export async function solicitacaoManutencaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoManutencao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    solicitacaoManutencaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SolicitacaoManutencaoWhereInput> = [];

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

      const solicitacoesManutencao = await tx.solicitacaoManutencao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return solicitacoesManutencao.map((solicitacaoManutencao) => ({
        id: solicitacaoManutencao.id,
        codigo: String(solicitacaoManutencao.codigo),
      }));
    },
  );
}

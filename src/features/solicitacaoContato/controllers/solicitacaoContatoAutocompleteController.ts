import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  solicitacaoContatoAutocompleteInputSchema,
  solicitacaoContatoAutocompleteOutputSchema,
} from '../solicitacaoContatoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solicitacao-contato/autocomplete',
  query: solicitacaoContatoAutocompleteInputSchema,
  response: z.array(solicitacaoContatoAutocompleteOutputSchema),
};

export const solicitacaoContatoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_autocomplete',
  description: dictionary.solicitacaoContato.mcpDescription.autocomplete,
  requiredPermissions: { solicitacaoContato: ['autocomplete'] },
  schema: toMcpJsonSchema(solicitacaoContatoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoAutocompleteController(params, context);
  },
});

export async function solicitacaoContatoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    solicitacaoContatoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SolicitacaoContatoWhereInput> = [];

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

      const solicitacoesContato = await tx.solicitacaoContato.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return solicitacoesContato.map((solicitacaoContato) => ({
        id: solicitacaoContato.id,
        nome: String(solicitacaoContato.nome),
      }));
    },
  );
}

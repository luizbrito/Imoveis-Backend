import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  empreendimentoAutocompleteInputSchema,
  empreendimentoAutocompleteOutputSchema,
} from '../empreendimentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/empreendimento/autocomplete',
  query: empreendimentoAutocompleteInputSchema,
  response: z.array(empreendimentoAutocompleteOutputSchema),
};

export const empreendimentoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_autocomplete',
  description: dictionary.empreendimento.mcpDescription.autocomplete,
  requiredPermissions: { empreendimento: ['autocomplete'] },
  schema: toMcpJsonSchema(empreendimentoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await empreendimentoAutocompleteController(params, context);
  },
});

export async function empreendimentoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    empreendimentoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.EmpreendimentoWhereInput> = [];

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

      const empreendimentos = await tx.empreendimento.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return empreendimentos.map((empreendimento) => ({
        id: empreendimento.id,
        nome: String(empreendimento.nome),
      }));
    },
  );
}

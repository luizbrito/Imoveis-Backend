import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  participanteLocacaoAutocompleteInputSchema,
  participanteLocacaoAutocompleteOutputSchema,
} from '../participanteLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const participanteLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/participante-locacao/autocomplete',
  query: participanteLocacaoAutocompleteInputSchema,
  response: z.array(participanteLocacaoAutocompleteOutputSchema),
};

export const participanteLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'participanteLocacao_autocomplete',
  description: dictionary.participanteLocacao.mcpDescription.autocomplete,
  requiredPermissions: { participanteLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(participanteLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await participanteLocacaoAutocompleteController(params, context);
  },
});

export async function participanteLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      participanteLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    participanteLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ParticipanteLocacaoWhereInput> = [];

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
          papel: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const participantesLocacao = await tx.participanteLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return participantesLocacao.map((participanteLocacao) => ({
        id: participanteLocacao.id,
        papel: String(participanteLocacao.papel),
      }));
    },
  );
}

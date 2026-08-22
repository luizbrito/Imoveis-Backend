import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  contratoAdministracaoAutocompleteInputSchema,
  contratoAdministracaoAutocompleteOutputSchema,
} from '../contratoAdministracaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-administracao/autocomplete',
  query: contratoAdministracaoAutocompleteInputSchema,
  response: z.array(contratoAdministracaoAutocompleteOutputSchema),
};

export const contratoAdministracaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_autocomplete',
  description: dictionary.contratoAdministracao.mcpDescription.autocomplete,
  requiredPermissions: { contratoAdministracao: ['autocomplete'] },
  schema: toMcpJsonSchema(contratoAdministracaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoAutocompleteController(params, context);
  },
});

export async function contratoAdministracaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    contratoAdministracaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoAdministracaoWhereInput> = [];

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
          numero: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const contratosAdministracao = await tx.contratoAdministracao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return contratosAdministracao.map((contratoAdministracao) => ({
        id: contratoAdministracao.id,
        numero: String(contratoAdministracao.numero),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  contratoLocacaoAutocompleteInputSchema,
  contratoLocacaoAutocompleteOutputSchema,
} from '../contratoLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/contrato-locacao/autocomplete',
  query: contratoLocacaoAutocompleteInputSchema,
  response: z.array(contratoLocacaoAutocompleteOutputSchema),
};

export const contratoLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_autocomplete',
  description: dictionary.contratoLocacao.mcpDescription.autocomplete,
  requiredPermissions: { contratoLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(contratoLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoAutocompleteController(params, context);
  },
});

export async function contratoLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    contratoLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ContratoLocacaoWhereInput> = [];

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

      const contratosLocacao = await tx.contratoLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return contratosLocacao.map((contratoLocacao) => ({
        id: contratoLocacao.id,
        numero: String(contratoLocacao.numero),
      }));
    },
  );
}

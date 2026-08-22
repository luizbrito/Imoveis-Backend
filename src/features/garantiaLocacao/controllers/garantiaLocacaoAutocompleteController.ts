import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  garantiaLocacaoAutocompleteInputSchema,
  garantiaLocacaoAutocompleteOutputSchema,
} from '../garantiaLocacaoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/garantia-locacao/autocomplete',
  query: garantiaLocacaoAutocompleteInputSchema,
  response: z.array(garantiaLocacaoAutocompleteOutputSchema),
};

export const garantiaLocacaoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantiaLocacao_autocomplete',
  description: dictionary.garantiaLocacao.mcpDescription.autocomplete,
  requiredPermissions: { garantiaLocacao: ['autocomplete'] },
  schema: toMcpJsonSchema(garantiaLocacaoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoAutocompleteController(params, context);
  },
});

export async function garantiaLocacaoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    garantiaLocacaoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.GarantiaLocacaoWhereInput> = [];

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
          tipo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const garantiasLocacao = await tx.garantiaLocacao.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return garantiasLocacao.map((garantiaLocacao) => ({
        id: garantiaLocacao.id,
        tipo: String(garantiaLocacao.tipo),
      }));
    },
  );
}

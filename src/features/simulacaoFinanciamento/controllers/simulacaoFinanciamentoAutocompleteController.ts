import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  simulacaoFinanciamentoAutocompleteInputSchema,
  simulacaoFinanciamentoAutocompleteOutputSchema,
} from '../simulacaoFinanciamentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/simulacao-financiamento/autocomplete',
  query: simulacaoFinanciamentoAutocompleteInputSchema,
  response: z.array(simulacaoFinanciamentoAutocompleteOutputSchema),
};

export const simulacaoFinanciamentoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_autocomplete',
  description: dictionary.simulacaoFinanciamento.mcpDescription.autocomplete,
  requiredPermissions: { simulacaoFinanciamento: ['autocomplete'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoAutocompleteController(params, context);
  },
});

export async function simulacaoFinanciamentoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      simulacaoFinanciamento: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    simulacaoFinanciamentoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SimulacaoFinanciamentoWhereInput> = [];

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
          dataSimulacao: {
            gte: new Date(search),
          },
        });
      }

      const simulacoesFinanciamento = await tx.simulacaoFinanciamento.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return simulacoesFinanciamento.map((simulacaoFinanciamento) => ({
        id: simulacaoFinanciamento.id,
        dataSimulacao: String(simulacaoFinanciamento.dataSimulacao),
      }));
    },
  );
}

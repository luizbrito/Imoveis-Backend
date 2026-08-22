import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  producaoHistoricaRuralAutocompleteInputSchema,
  producaoHistoricaRuralAutocompleteOutputSchema,
} from '../producaoHistoricaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/producao-historica-rural/autocomplete',
  query: producaoHistoricaRuralAutocompleteInputSchema,
  response: z.array(producaoHistoricaRuralAutocompleteOutputSchema),
};

export const producaoHistoricaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_autocomplete',
  description: dictionary.producaoHistoricaRural.mcpDescription.autocomplete,
  requiredPermissions: { producaoHistoricaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralAutocompleteController(params, context);
  },
});

export async function producaoHistoricaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    producaoHistoricaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ProducaoHistoricaRuralWhereInput> = [];

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
          safraAno: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const producoesHistoricasRurais =
        await tx.producaoHistoricaRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return producoesHistoricasRurais.map((producaoHistoricaRural) => ({
        id: producaoHistoricaRural.id,
        safraAno: String(producaoHistoricaRural.safraAno),
      }));
    },
  );
}

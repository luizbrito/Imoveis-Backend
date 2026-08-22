import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  ativoIncluidoVendaRuralAutocompleteInputSchema,
  ativoIncluidoVendaRuralAutocompleteOutputSchema,
} from '../ativoIncluidoVendaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ativo-incluido-venda-rural/autocomplete',
  query: ativoIncluidoVendaRuralAutocompleteInputSchema,
  response: z.array(ativoIncluidoVendaRuralAutocompleteOutputSchema),
};

export const ativoIncluidoVendaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_autocomplete',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.autocomplete,
  requiredPermissions: { ativoIncluidoVendaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralAutocompleteController(params, context);
  },
});

export async function ativoIncluidoVendaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    ativoIncluidoVendaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.AtivoIncluidoVendaRuralWhereInput> = [];

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

      const ativosIncluidosVendaRural =
        await tx.ativoIncluidoVendaRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return ativosIncluidosVendaRural.map((ativoIncluidoVendaRural) => ({
        id: ativoIncluidoVendaRural.id,
        nome: String(ativoIncluidoVendaRural.nome),
      }));
    },
  );
}

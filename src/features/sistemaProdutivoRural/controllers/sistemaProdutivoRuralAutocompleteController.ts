import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  sistemaProdutivoRuralAutocompleteInputSchema,
  sistemaProdutivoRuralAutocompleteOutputSchema,
} from '../sistemaProdutivoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/sistema-produtivo-rural/autocomplete',
  query: sistemaProdutivoRuralAutocompleteInputSchema,
  response: z.array(sistemaProdutivoRuralAutocompleteOutputSchema),
};

export const sistemaProdutivoRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_autocomplete',
  description: dictionary.sistemaProdutivoRural.mcpDescription.autocomplete,
  requiredPermissions: { sistemaProdutivoRural: ['autocomplete'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralAutocompleteController(params, context);
  },
});

export async function sistemaProdutivoRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    sistemaProdutivoRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SistemaProdutivoRuralWhereInput> = [];

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

      const sistemasProdutivosRurais = await tx.sistemaProdutivoRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return sistemasProdutivosRurais.map((sistemaProdutivoRural) => ({
        id: sistemaProdutivoRural.id,
        nome: String(sistemaProdutivoRural.nome),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  soloImovelRuralAutocompleteInputSchema,
  soloImovelRuralAutocompleteOutputSchema,
} from '../soloImovelRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const soloImovelRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/solo-imovel-rural/autocomplete',
  query: soloImovelRuralAutocompleteInputSchema,
  response: z.array(soloImovelRuralAutocompleteOutputSchema),
};

export const soloImovelRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'soloImovelRural_autocomplete',
  description: dictionary.soloImovelRural.mcpDescription.autocomplete,
  requiredPermissions: { soloImovelRural: ['autocomplete'] },
  schema: toMcpJsonSchema(soloImovelRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await soloImovelRuralAutocompleteController(params, context);
  },
});

export async function soloImovelRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      soloImovelRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    soloImovelRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SoloImovelRuralWhereInput> = [];

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
          nomeArea: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const solosImoveisRurais = await tx.soloImovelRural.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return solosImoveisRurais.map((soloImovelRural) => ({
        id: soloImovelRural.id,
        nomeArea: String(soloImovelRural.nomeArea),
      }));
    },
  );
}

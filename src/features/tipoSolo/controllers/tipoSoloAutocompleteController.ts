import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  tipoSoloAutocompleteInputSchema,
  tipoSoloAutocompleteOutputSchema,
} from '../tipoSoloSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tipoSoloAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tipo-solo/autocomplete',
  query: tipoSoloAutocompleteInputSchema,
  response: z.array(tipoSoloAutocompleteOutputSchema),
};

export const tipoSoloAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tipoSolo_autocomplete',
  description: dictionary.tipoSolo.mcpDescription.autocomplete,
  requiredPermissions: { tipoSolo: ['autocomplete'] },
  schema: toMcpJsonSchema(tipoSoloAutocompleteInputSchema),
  handler: async (params, context) => {
    return await tipoSoloAutocompleteController(params, context);
  },
});

export async function tipoSoloAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tipoSolo: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    tipoSoloAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TipoSoloWhereInput> = [];

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

      const tiposSolo = await tx.tipoSolo.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return tiposSolo.map((tipoSolo) => ({
        id: tipoSolo.id,
        nome: String(tipoSolo.nome),
      }));
    },
  );
}

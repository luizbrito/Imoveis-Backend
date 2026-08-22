import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  visitaAutocompleteInputSchema,
  visitaAutocompleteOutputSchema,
} from '../visitaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/visita/autocomplete',
  query: visitaAutocompleteInputSchema,
  response: z.array(visitaAutocompleteOutputSchema),
};

export const visitaAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_autocomplete',
  description: dictionary.visita.mcpDescription.autocomplete,
  requiredPermissions: { visita: ['autocomplete'] },
  schema: toMcpJsonSchema(visitaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await visitaAutocompleteController(params, context);
  },
});

export async function visitaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      visita: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    visitaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VisitaWhereInput> = [];

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
          codigo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const visitas = await tx.visita.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return visitas.map((visita) => ({
        id: visita.id,
        codigo: String(visita.codigo),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  estadoAutocompleteInputSchema,
  estadoAutocompleteOutputSchema,
} from '../estadoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/estado/autocomplete',
  query: estadoAutocompleteInputSchema,
  response: z.array(estadoAutocompleteOutputSchema),
};

export const estadoAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_autocomplete',
  description: dictionary.estado.mcpDescription.autocomplete,
  requiredPermissions: { estado: ['autocomplete'] },
  schema: toMcpJsonSchema(estadoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await estadoAutocompleteController(params, context);
  },
});

export async function estadoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      estado: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    estadoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.EstadoWhereInput> = [];

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

      const estados = await tx.estado.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return estados.map((estado) => ({
        id: estado.id,
        nome: String(estado.nome),
      }));
    },
  );
}

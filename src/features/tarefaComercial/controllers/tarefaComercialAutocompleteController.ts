import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  tarefaComercialAutocompleteInputSchema,
  tarefaComercialAutocompleteOutputSchema,
} from '../tarefaComercialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tarefa-comercial/autocomplete',
  query: tarefaComercialAutocompleteInputSchema,
  response: z.array(tarefaComercialAutocompleteOutputSchema),
};

export const tarefaComercialAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_autocomplete',
  description: dictionary.tarefaComercial.mcpDescription.autocomplete,
  requiredPermissions: { tarefaComercial: ['autocomplete'] },
  schema: toMcpJsonSchema(tarefaComercialAutocompleteInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialAutocompleteController(params, context);
  },
});

export async function tarefaComercialAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      tarefaComercial: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    tarefaComercialAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.TarefaComercialWhereInput> = [];

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
          titulo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const tarefasComerciais = await tx.tarefaComercial.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return tarefasComerciais.map((tarefaComercial) => ({
        id: tarefaComercial.id,
        titulo: String(tarefaComercial.titulo),
      }));
    },
  );
}

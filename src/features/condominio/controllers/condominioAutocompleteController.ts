import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  condominioAutocompleteInputSchema,
  condominioAutocompleteOutputSchema,
} from '../condominioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/condominio/autocomplete',
  query: condominioAutocompleteInputSchema,
  response: z.array(condominioAutocompleteOutputSchema),
};

export const condominioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condominio_autocomplete',
  description: dictionary.condominio.mcpDescription.autocomplete,
  requiredPermissions: { condominio: ['autocomplete'] },
  schema: toMcpJsonSchema(condominioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await condominioAutocompleteController(params, context);
  },
});

export async function condominioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condominio: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    condominioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CondominioWhereInput> = [];

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

      const condominios = await tx.condominio.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return condominios.map((condominio) => ({
        id: condominio.id,
        nome: String(condominio.nome),
      }));
    },
  );
}

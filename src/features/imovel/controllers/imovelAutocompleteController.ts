import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  imovelAutocompleteInputSchema,
  imovelAutocompleteOutputSchema,
} from '../imovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel/autocomplete',
  query: imovelAutocompleteInputSchema,
  response: z.array(imovelAutocompleteOutputSchema),
};

export const imovelAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'imovel_autocomplete',
  description: dictionary.imovel.mcpDescription.autocomplete,
  requiredPermissions: { imovel: ['autocomplete'] },
  schema: toMcpJsonSchema(imovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await imovelAutocompleteController(params, context);
  },
});

export async function imovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    imovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ImovelWhereInput> = [];

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

      const imoveis = await tx.imovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return imoveis.map((imovel) => ({
        id: imovel.id,
        titulo: String(imovel.titulo),
      }));
    },
  );
}

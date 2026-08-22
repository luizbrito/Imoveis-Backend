import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  seguroImovelAutocompleteInputSchema,
  seguroImovelAutocompleteOutputSchema,
} from '../seguroImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/seguro-imovel/autocomplete',
  query: seguroImovelAutocompleteInputSchema,
  response: z.array(seguroImovelAutocompleteOutputSchema),
};

export const seguroImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'seguroImovel_autocomplete',
  description: dictionary.seguroImovel.mcpDescription.autocomplete,
  requiredPermissions: { seguroImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(seguroImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await seguroImovelAutocompleteController(params, context);
  },
});

export async function seguroImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      seguroImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    seguroImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.SeguroImovelWhereInput> = [];

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
          numeroApolice: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const segurosImovel = await tx.seguroImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return segurosImovel.map((seguroImovel) => ({
        id: seguroImovel.id,
        numeroApolice: String(seguroImovel.numeroApolice),
      }));
    },
  );
}

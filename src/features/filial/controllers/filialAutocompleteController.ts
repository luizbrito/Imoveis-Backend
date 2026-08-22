import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  filialAutocompleteInputSchema,
  filialAutocompleteOutputSchema,
} from '../filialSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/filial/autocomplete',
  query: filialAutocompleteInputSchema,
  response: z.array(filialAutocompleteOutputSchema),
};

export const filialAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_autocomplete',
  description: dictionary.filial.mcpDescription.autocomplete,
  requiredPermissions: { filial: ['autocomplete'] },
  schema: toMcpJsonSchema(filialAutocompleteInputSchema),
  handler: async (params, context) => {
    return await filialAutocompleteController(params, context);
  },
});

export async function filialAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    filialAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FilialWhereInput> = [];

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

      const filiais = await tx.filial.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return filiais.map((filial) => ({
        id: filial.id,
        nome: String(filial.nome),
      }));
    },
  );
}

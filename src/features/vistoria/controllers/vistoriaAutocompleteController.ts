import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  vistoriaAutocompleteInputSchema,
  vistoriaAutocompleteOutputSchema,
} from '../vistoriaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/vistoria/autocomplete',
  query: vistoriaAutocompleteInputSchema,
  response: z.array(vistoriaAutocompleteOutputSchema),
};

export const vistoriaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'vistoria_autocomplete',
  description: dictionary.vistoria.mcpDescription.autocomplete,
  requiredPermissions: { vistoria: ['autocomplete'] },
  schema: toMcpJsonSchema(vistoriaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await vistoriaAutocompleteController(params, context);
  },
});

export async function vistoriaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    vistoriaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.VistoriaWhereInput> = [];

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

      const vistorias = await tx.vistoria.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return vistorias.map((vistoria) => ({
        id: vistoria.id,
        codigo: String(vistoria.codigo),
      }));
    },
  );
}

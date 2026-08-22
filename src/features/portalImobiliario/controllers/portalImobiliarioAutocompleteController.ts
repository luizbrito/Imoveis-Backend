import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  portalImobiliarioAutocompleteInputSchema,
  portalImobiliarioAutocompleteOutputSchema,
} from '../portalImobiliarioSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const portalImobiliarioAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/portal-imobiliario/autocomplete',
  query: portalImobiliarioAutocompleteInputSchema,
  response: z.array(portalImobiliarioAutocompleteOutputSchema),
};

export const portalImobiliarioAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'portalImobiliario_autocomplete',
  description: dictionary.portalImobiliario.mcpDescription.autocomplete,
  requiredPermissions: { portalImobiliario: ['autocomplete'] },
  schema: toMcpJsonSchema(portalImobiliarioAutocompleteInputSchema),
  handler: async (params, context) => {
    return await portalImobiliarioAutocompleteController(params, context);
  },
});

export async function portalImobiliarioAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      portalImobiliario: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    portalImobiliarioAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PortalImobiliarioWhereInput> = [];

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

      const portaisImobiliarios = await tx.portalImobiliario.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return portaisImobiliarios.map((portalImobiliario) => ({
        id: portalImobiliario.id,
        nome: String(portalImobiliario.nome),
      }));
    },
  );
}

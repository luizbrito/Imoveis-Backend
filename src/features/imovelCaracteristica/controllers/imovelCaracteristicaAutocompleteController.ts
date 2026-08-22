import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  imovelCaracteristicaAutocompleteInputSchema,
  imovelCaracteristicaAutocompleteOutputSchema,
} from '../imovelCaracteristicaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const imovelCaracteristicaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/imovel-caracteristica/autocomplete',
  query: imovelCaracteristicaAutocompleteInputSchema,
  response: z.array(imovelCaracteristicaAutocompleteOutputSchema),
};

export const imovelCaracteristicaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'imovelCaracteristica_autocomplete',
  description: dictionary.imovelCaracteristica.mcpDescription.autocomplete,
  requiredPermissions: { imovelCaracteristica: ['autocomplete'] },
  schema: toMcpJsonSchema(imovelCaracteristicaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await imovelCaracteristicaAutocompleteController(params, context);
  },
});

export async function imovelCaracteristicaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      imovelCaracteristica: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    imovelCaracteristicaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ImovelCaracteristicaWhereInput> = [];

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
          valorTexto: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const imoveisCaracteristicas = await tx.imovelCaracteristica.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return imoveisCaracteristicas.map((imovelCaracteristica) => ({
        id: imovelCaracteristica.id,
        valorTexto: String(imovelCaracteristica.valorTexto),
      }));
    },
  );
}

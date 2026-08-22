import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  referenciaClimaticaRuralAutocompleteInputSchema,
  referenciaClimaticaRuralAutocompleteOutputSchema,
} from '../referenciaClimaticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referencia-climatica-rural/autocomplete',
  query: referenciaClimaticaRuralAutocompleteInputSchema,
  response: z.array(referenciaClimaticaRuralAutocompleteOutputSchema),
};

export const referenciaClimaticaRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_autocomplete',
  description: dictionary.referenciaClimaticaRural.mcpDescription.autocomplete,
  requiredPermissions: { referenciaClimaticaRural: ['autocomplete'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralAutocompleteInputSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralAutocompleteController(
      params,
      context,
    );
  },
});

export async function referenciaClimaticaRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    referenciaClimaticaRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ReferenciaClimaticaRuralWhereInput> = [];

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

      const referenciasClimaticasRurais =
        await tx.referenciaClimaticaRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return referenciasClimaticasRurais.map((referenciaClimaticaRural) => ({
        id: referenciaClimaticaRural.id,
        titulo: String(referenciaClimaticaRural.titulo),
      }));
    },
  );
}

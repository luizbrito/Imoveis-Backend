import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  infraestruturaEnergiaConectividadeAutocompleteInputSchema,
  infraestruturaEnergiaConectividadeAutocompleteOutputSchema,
} from '../infraestruturaEnergiaConectividadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeAutocompleteApiDoc: RouteConfig =
  {
    method: 'get',
    path: '/api/infraestrutura-energia-conectividade/autocomplete',
    query: infraestruturaEnergiaConectividadeAutocompleteInputSchema,
    response: z.array(
      infraestruturaEnergiaConectividadeAutocompleteOutputSchema,
    ),
  };

export const infraestruturaEnergiaConectividadeAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_autocomplete',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.autocomplete,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['autocomplete'] },
  schema: toMcpJsonSchema(
    infraestruturaEnergiaConectividadeAutocompleteInputSchema,
  ),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeAutocompleteController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    infraestruturaEnergiaConectividadeAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.InfraestruturaEnergiaConectividadeWhereInput> =
        [];

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
          descricao: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const infraestruturasEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return infraestruturasEnergiaConectividade.map(
        (infraestruturaEnergiaConectividade) => ({
          id: infraestruturaEnergiaConectividade.id,
          descricao: String(infraestruturaEnergiaConectividade.descricao),
        }),
      );
    },
  );
}

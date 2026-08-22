import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  ordemServicoAutocompleteInputSchema,
  ordemServicoAutocompleteOutputSchema,
} from '../ordemServicoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ordem-servico/autocomplete',
  query: ordemServicoAutocompleteInputSchema,
  response: z.array(ordemServicoAutocompleteOutputSchema),
};

export const ordemServicoAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ordemServico_autocomplete',
  description: dictionary.ordemServico.mcpDescription.autocomplete,
  requiredPermissions: { ordemServico: ['autocomplete'] },
  schema: toMcpJsonSchema(ordemServicoAutocompleteInputSchema),
  handler: async (params, context) => {
    return await ordemServicoAutocompleteController(params, context);
  },
});

export async function ordemServicoAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ordemServico: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    ordemServicoAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.OrdemServicoWhereInput> = [];

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

      const ordensServico = await tx.ordemServico.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return ordensServico.map((ordemServico) => ({
        id: ordemServico.id,
        codigo: String(ordemServico.codigo),
      }));
    },
  );
}

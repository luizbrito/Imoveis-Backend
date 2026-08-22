import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  fornecedorAutocompleteInputSchema,
  fornecedorAutocompleteOutputSchema,
} from '../fornecedorSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const fornecedorAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/fornecedor/autocomplete',
  query: fornecedorAutocompleteInputSchema,
  response: z.array(fornecedorAutocompleteOutputSchema),
};

export const fornecedorAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'fornecedor_autocomplete',
  description: dictionary.fornecedor.mcpDescription.autocomplete,
  requiredPermissions: { fornecedor: ['autocomplete'] },
  schema: toMcpJsonSchema(fornecedorAutocompleteInputSchema),
  handler: async (params, context) => {
    return await fornecedorAutocompleteController(params, context);
  },
});

export async function fornecedorAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      fornecedor: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    fornecedorAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.FornecedorWhereInput> = [];

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
          nomeRazaoSocial: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const fornecedores = await tx.fornecedor.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return fornecedores.map((fornecedor) => ({
        id: fornecedor.id,
        nomeRazaoSocial: String(fornecedor.nomeRazaoSocial),
      }));
    },
  );
}

import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  publicacaoPortalAutocompleteInputSchema,
  publicacaoPortalAutocompleteOutputSchema,
} from '../publicacaoPortalSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const publicacaoPortalAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/publicacao-portal/autocomplete',
  query: publicacaoPortalAutocompleteInputSchema,
  response: z.array(publicacaoPortalAutocompleteOutputSchema),
};

export const publicacaoPortalAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'publicacaoPortal_autocomplete',
  description: dictionary.publicacaoPortal.mcpDescription.autocomplete,
  requiredPermissions: { publicacaoPortal: ['autocomplete'] },
  schema: toMcpJsonSchema(publicacaoPortalAutocompleteInputSchema),
  handler: async (params, context) => {
    return await publicacaoPortalAutocompleteController(params, context);
  },
});

export async function publicacaoPortalAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      publicacaoPortal: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    publicacaoPortalAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.PublicacaoPortalWhereInput> = [];

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
          codigoExterno: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const publicacoesPortal = await tx.publicacaoPortal.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return publicacoesPortal.map((publicacaoPortal) => ({
        id: publicacaoPortal.id,
        codigoExterno: String(publicacaoPortal.codigoExterno),
      }));
    },
  );
}

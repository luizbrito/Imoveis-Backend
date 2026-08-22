import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  documentoImovelAutocompleteInputSchema,
  documentoImovelAutocompleteOutputSchema,
} from '../documentoImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-imovel/autocomplete',
  query: documentoImovelAutocompleteInputSchema,
  response: z.array(documentoImovelAutocompleteOutputSchema),
};

export const documentoImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoImovel_autocomplete',
  description: dictionary.documentoImovel.mcpDescription.autocomplete,
  requiredPermissions: { documentoImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(documentoImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await documentoImovelAutocompleteController(params, context);
  },
});

export async function documentoImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    documentoImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentoImovelWhereInput> = [];

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

      const documentosImovel = await tx.documentoImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return documentosImovel.map((documentoImovel) => ({
        id: documentoImovel.id,
        titulo: String(documentoImovel.titulo),
      }));
    },
  );
}

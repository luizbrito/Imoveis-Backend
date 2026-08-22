import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  documentoPessoaAutocompleteInputSchema,
  documentoPessoaAutocompleteOutputSchema,
} from '../documentoPessoaSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentoPessoaAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documento-pessoa/autocomplete',
  query: documentoPessoaAutocompleteInputSchema,
  response: z.array(documentoPessoaAutocompleteOutputSchema),
};

export const documentoPessoaAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentoPessoa_autocomplete',
  description: dictionary.documentoPessoa.mcpDescription.autocomplete,
  requiredPermissions: { documentoPessoa: ['autocomplete'] },
  schema: toMcpJsonSchema(documentoPessoaAutocompleteInputSchema),
  handler: async (params, context) => {
    return await documentoPessoaAutocompleteController(params, context);
  },
});

export async function documentoPessoaAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentoPessoa: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    documentoPessoaAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentoPessoaWhereInput> = [];

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

      const documentosPessoas = await tx.documentoPessoa.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return documentosPessoas.map((documentoPessoa) => ({
        id: documentoPessoa.id,
        titulo: String(documentoPessoa.titulo),
      }));
    },
  );
}

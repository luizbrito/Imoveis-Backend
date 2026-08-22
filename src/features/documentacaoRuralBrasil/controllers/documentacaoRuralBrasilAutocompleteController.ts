import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  documentacaoRuralBrasilAutocompleteInputSchema,
  documentacaoRuralBrasilAutocompleteOutputSchema,
} from '../documentacaoRuralBrasilSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documentacao-rural-brasil/autocomplete',
  query: documentacaoRuralBrasilAutocompleteInputSchema,
  response: z.array(documentacaoRuralBrasilAutocompleteOutputSchema),
};

export const documentacaoRuralBrasilAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_autocomplete',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.autocomplete,
  requiredPermissions: { documentacaoRuralBrasil: ['autocomplete'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilAutocompleteInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilAutocompleteController(params, context);
  },
});

export async function documentacaoRuralBrasilAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    documentacaoRuralBrasilAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.DocumentacaoRuralBrasilWhereInput> = [];

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
          matriculaNumero: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const documentacoesRuraisBrasil =
        await tx.documentacaoRuralBrasil.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return documentacoesRuraisBrasil.map((documentacaoRuralBrasil) => ({
        id: documentacaoRuralBrasil.id,
        matriculaNumero: String(documentacaoRuralBrasil.matriculaNumero),
      }));
    },
  );
}

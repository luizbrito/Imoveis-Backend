import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  consentimentoLGPDAutocompleteInputSchema,
  consentimentoLGPDAutocompleteOutputSchema,
} from '../consentimentoLGPDSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/consentimento-l-g-p-d/autocomplete',
  query: consentimentoLGPDAutocompleteInputSchema,
  response: z.array(consentimentoLGPDAutocompleteOutputSchema),
};

export const consentimentoLGPDAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_autocomplete',
  description: dictionary.consentimentoLGPD.mcpDescription.autocomplete,
  requiredPermissions: { consentimentoLGPD: ['autocomplete'] },
  schema: toMcpJsonSchema(consentimentoLGPDAutocompleteInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDAutocompleteController(params, context);
  },
});

export async function consentimentoLGPDAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    consentimentoLGPDAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.ConsentimentoLGPDWhereInput> = [];

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
          tipo: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const consentimentosLGPD = await tx.consentimentoLGPD.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return consentimentosLGPD.map((consentimentoLGPD) => ({
        id: consentimentoLGPD.id,
        tipo: String(consentimentoLGPD.tipo),
      }));
    },
  );
}

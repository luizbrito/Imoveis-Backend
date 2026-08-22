import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  certificacaoSustentabilidadeRuralAutocompleteInputSchema,
  certificacaoSustentabilidadeRuralAutocompleteOutputSchema,
} from '../certificacaoSustentabilidadeRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralAutocompleteApiDoc: RouteConfig =
  {
    method: 'get',
    path: '/api/certificacao-sustentabilidade-rural/autocomplete',
    query: certificacaoSustentabilidadeRuralAutocompleteInputSchema,
    response: z.array(
      certificacaoSustentabilidadeRuralAutocompleteOutputSchema,
    ),
  };

export const certificacaoSustentabilidadeRuralAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_autocomplete',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.autocomplete,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['autocomplete'] },
  schema: toMcpJsonSchema(
    certificacaoSustentabilidadeRuralAutocompleteInputSchema,
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralAutocompleteController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    certificacaoSustentabilidadeRuralAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.CertificacaoSustentabilidadeRuralWhereInput> =
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
          nome: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }

      const certificacoesSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findMany({
          where: {
            AND: whereAnd,
          },
          take,
          orderBy,
        });

      return certificacoesSustentabilidadeRural.map(
        (certificacaoSustentabilidadeRural) => ({
          id: certificacaoSustentabilidadeRural.id,
          nome: String(certificacaoSustentabilidadeRural.nome),
        }),
      );
    },
  );
}

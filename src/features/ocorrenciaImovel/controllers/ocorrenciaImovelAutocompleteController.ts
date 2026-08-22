import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  ocorrenciaImovelAutocompleteInputSchema,
  ocorrenciaImovelAutocompleteOutputSchema,
} from '../ocorrenciaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ocorrencia-imovel/autocomplete',
  query: ocorrenciaImovelAutocompleteInputSchema,
  response: z.array(ocorrenciaImovelAutocompleteOutputSchema),
};

export const ocorrenciaImovelAutocompleteMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_autocomplete',
  description: dictionary.ocorrenciaImovel.mcpDescription.autocomplete,
  requiredPermissions: { ocorrenciaImovel: ['autocomplete'] },
  schema: toMcpJsonSchema(ocorrenciaImovelAutocompleteInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelAutocompleteController(params, context);
  },
});

export async function ocorrenciaImovelAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    ocorrenciaImovelAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.OcorrenciaImovelWhereInput> = [];

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

      const ocorrenciasImovel = await tx.ocorrenciaImovel.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
      });

      return ocorrenciasImovel.map((ocorrenciaImovel) => ({
        id: ocorrenciaImovel.id,
        codigo: String(ocorrenciaImovel.codigo),
      }));
    },
  );
}

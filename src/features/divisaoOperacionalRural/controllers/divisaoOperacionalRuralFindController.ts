import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { divisaoOperacionalRuralFindSchema } from '../divisaoOperacionalRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const divisaoOperacionalRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/divisao-operacional-rural/{id}',
  params: divisaoOperacionalRuralFindSchema,
  response: 'DivisaoOperacionalRural',
};

export const divisaoOperacionalRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'divisaoOperacionalRural_get',
  description: dictionary.divisaoOperacionalRural.mcpDescription.get,
  requiredPermissions: { divisaoOperacionalRural: ['read'] },
  schema: toMcpJsonSchema(divisaoOperacionalRuralFindSchema),
  handler: async (params, context) => {
    return await divisaoOperacionalRuralFindController(params, context);
  },
});

export async function divisaoOperacionalRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      divisaoOperacionalRural: ['read'],
    },
    context,
  );

  const { id } = divisaoOperacionalRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let divisaoOperacionalRural = await tx.divisaoOperacionalRural.findUnique(
        {
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            createdByMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            updatedByMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            archivedByMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      );

      divisaoOperacionalRural = await filePopulateDownloadUrlInTree(
        divisaoOperacionalRural,
      );

      return divisaoOperacionalRural;
    },
  );
}

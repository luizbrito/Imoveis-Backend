import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { pistaAviacaoRuralFindSchema } from '../pistaAviacaoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const pistaAviacaoRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/pista-aviacao-rural/{id}',
  params: pistaAviacaoRuralFindSchema,
  response: 'PistaAviacaoRural',
};

export const pistaAviacaoRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'pistaAviacaoRural_get',
  description: dictionary.pistaAviacaoRural.mcpDescription.get,
  requiredPermissions: { pistaAviacaoRural: ['read'] },
  schema: toMcpJsonSchema(pistaAviacaoRuralFindSchema),
  handler: async (params, context) => {
    return await pistaAviacaoRuralFindController(params, context);
  },
});

export async function pistaAviacaoRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      pistaAviacaoRural: ['read'],
    },
    context,
  );

  const { id } = pistaAviacaoRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let pistaAviacaoRural = await tx.pistaAviacaoRural.findUnique({
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
      });

      pistaAviacaoRural =
        await filePopulateDownloadUrlInTree(pistaAviacaoRural);

      return pistaAviacaoRural;
    },
  );
}

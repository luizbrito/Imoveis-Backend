import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { referenciaClimaticaRuralFindSchema } from '../referenciaClimaticaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const referenciaClimaticaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/referencia-climatica-rural/{id}',
  params: referenciaClimaticaRuralFindSchema,
  response: 'ReferenciaClimaticaRural',
};

export const referenciaClimaticaRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'referenciaClimaticaRural_get',
  description: dictionary.referenciaClimaticaRural.mcpDescription.get,
  requiredPermissions: { referenciaClimaticaRural: ['read'] },
  schema: toMcpJsonSchema(referenciaClimaticaRuralFindSchema),
  handler: async (params, context) => {
    return await referenciaClimaticaRuralFindController(params, context);
  },
});

export async function referenciaClimaticaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      referenciaClimaticaRural: ['read'],
    },
    context,
  );

  const { id } = referenciaClimaticaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let referenciaClimaticaRural =
        await tx.referenciaClimaticaRural.findUnique({
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

      referenciaClimaticaRural = await filePopulateDownloadUrlInTree(
        referenciaClimaticaRural,
      );

      return referenciaClimaticaRural;
    },
  );
}

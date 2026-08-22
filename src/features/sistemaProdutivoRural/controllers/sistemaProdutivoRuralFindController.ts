import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { sistemaProdutivoRuralFindSchema } from '../sistemaProdutivoRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/sistema-produtivo-rural/{id}',
  params: sistemaProdutivoRuralFindSchema,
  response: 'SistemaProdutivoRural',
};

export const sistemaProdutivoRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_get',
  description: dictionary.sistemaProdutivoRural.mcpDescription.get,
  requiredPermissions: { sistemaProdutivoRural: ['read'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralFindSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralFindController(params, context);
  },
});

export async function sistemaProdutivoRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['read'],
    },
    context,
  );

  const { id } = sistemaProdutivoRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let sistemaProdutivoRural = await tx.sistemaProdutivoRural.findUnique({
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

      sistemaProdutivoRural = await filePopulateDownloadUrlInTree(
        sistemaProdutivoRural,
      );

      return sistemaProdutivoRural;
    },
  );
}

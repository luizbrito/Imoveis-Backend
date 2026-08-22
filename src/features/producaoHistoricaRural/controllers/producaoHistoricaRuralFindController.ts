import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { producaoHistoricaRuralFindSchema } from '../producaoHistoricaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const producaoHistoricaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/producao-historica-rural/{id}',
  params: producaoHistoricaRuralFindSchema,
  response: 'ProducaoHistoricaRural',
};

export const producaoHistoricaRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'producaoHistoricaRural_get',
  description: dictionary.producaoHistoricaRural.mcpDescription.get,
  requiredPermissions: { producaoHistoricaRural: ['read'] },
  schema: toMcpJsonSchema(producaoHistoricaRuralFindSchema),
  handler: async (params, context) => {
    return await producaoHistoricaRuralFindController(params, context);
  },
});

export async function producaoHistoricaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      producaoHistoricaRural: ['read'],
    },
    context,
  );

  const { id } = producaoHistoricaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let producaoHistoricaRural = await tx.producaoHistoricaRural.findUnique({
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

      producaoHistoricaRural = await filePopulateDownloadUrlInTree(
        producaoHistoricaRural,
      );

      return producaoHistoricaRural;
    },
  );
}

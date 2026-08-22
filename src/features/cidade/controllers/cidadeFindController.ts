import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { cidadeFindSchema } from '../cidadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const cidadeFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/cidade/{id}',
  params: cidadeFindSchema,
  response: 'Cidade',
};

export const cidadeFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cidade_get',
  description: dictionary.cidade.mcpDescription.get,
  requiredPermissions: { cidade: ['read'] },
  schema: toMcpJsonSchema(cidadeFindSchema),
  handler: async (params, context) => {
    return await cidadeFindController(params, context);
  },
});

export async function cidadeFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cidade: ['read'],
    },
    context,
  );

  const { id } = cidadeFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let cidade = await tx.cidade.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          estado: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisCidade: {
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

      cidade = await filePopulateDownloadUrlInTree(cidade);

      return cidade;
    },
  );
}

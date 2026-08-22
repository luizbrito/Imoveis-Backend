import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { interacaoLeadFindSchema } from '../interacaoLeadSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const interacaoLeadFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/interacao-lead/{id}',
  params: interacaoLeadFindSchema,
  response: 'InteracaoLead',
};

export const interacaoLeadFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'interacaoLead_get',
  description: dictionary.interacaoLead.mcpDescription.get,
  requiredPermissions: { interacaoLead: ['read'] },
  schema: toMcpJsonSchema(interacaoLeadFindSchema),
  handler: async (params, context) => {
    return await interacaoLeadFindController(params, context);
  },
});

export async function interacaoLeadFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      interacaoLead: ['read'],
    },
    context,
  );

  const { id } = interacaoLeadFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let interacaoLead = await tx.interacaoLead.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
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

      interacaoLead = await filePopulateDownloadUrlInTree(interacaoLead);

      return interacaoLead;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { empreendimentoFindSchema } from '../empreendimentoSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/empreendimento/{id}',
  params: empreendimentoFindSchema,
  response: 'Empreendimento',
};

export const empreendimentoFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'empreendimento_get',
  description: dictionary.empreendimento.mcpDescription.get,
  requiredPermissions: { empreendimento: ['read'] },
  schema: toMcpJsonSchema(empreendimentoFindSchema),
  handler: async (params, context) => {
    return await empreendimentoFindController(params, context);
  },
});

export async function empreendimentoFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['read'],
    },
    context,
  );

  const { id } = empreendimentoFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let empreendimento = await tx.empreendimento.findUnique({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          unidades: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
            select: {
              id: true,
              nome: true,
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

      empreendimento = await filePopulateDownloadUrlInTree(empreendimento);

      return empreendimento;
    },
  );
}

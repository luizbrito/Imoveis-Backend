import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ocorrenciaImovelFindSchema } from '../ocorrenciaImovelSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ocorrencia-imovel/{id}',
  params: ocorrenciaImovelFindSchema,
  response: 'OcorrenciaImovel',
};

export const ocorrenciaImovelFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_get',
  description: dictionary.ocorrenciaImovel.mcpDescription.get,
  requiredPermissions: { ocorrenciaImovel: ['read'] },
  schema: toMcpJsonSchema(ocorrenciaImovelFindSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelFindController(params, context);
  },
});

export async function ocorrenciaImovelFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['read'],
    },
    context,
  );

  const { id } = ocorrenciaImovelFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let ocorrenciaImovel = await tx.ocorrenciaImovel.findUnique({
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          clienteRelator: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretorResponsavel: {
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

      ocorrenciaImovel = await filePopulateDownloadUrlInTree(ocorrenciaImovel);

      return ocorrenciaImovel;
    },
  );
}

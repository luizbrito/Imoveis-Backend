import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { arquivoKmlFindSchema } from '../arquivoKmlSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/arquivo-kml/{id}',
  params: arquivoKmlFindSchema,
  response: 'ArquivoKml',
};

export const arquivoKmlFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'arquivoKml_get',
  description: dictionary.arquivoKml.mcpDescription.get,
  requiredPermissions: { arquivoKml: ['read'] },
  schema: toMcpJsonSchema(arquivoKmlFindSchema),
  handler: async (params, context) => {
    return await arquivoKmlFindController(params, context);
  },
});

export async function arquivoKmlFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['read'],
    },
    context,
  );

  const { id } = arquivoKmlFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let arquivoKml = await tx.arquivoKml.findUnique({
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
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          condominio: {
            select: {
              id: true,
              nome: true,
            },
          },
          cadastradoPor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          versoesPosteriores: {
            select: {
              id: true,
              nome: true,
            },
          },
          documentacaoRuralBrasil: {
            select: {
              id: true,
              matriculaNumero: true,
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

      arquivoKml = await filePopulateDownloadUrlInTree(arquivoKml);

      return arquivoKml;
    },
  );
}

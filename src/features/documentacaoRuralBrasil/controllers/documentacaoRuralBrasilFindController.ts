import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentacaoRuralBrasilFindSchema } from '../documentacaoRuralBrasilSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/documentacao-rural-brasil/{id}',
  params: documentacaoRuralBrasilFindSchema,
  response: 'DocumentacaoRuralBrasil',
};

export const documentacaoRuralBrasilFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_get',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.get,
  requiredPermissions: { documentacaoRuralBrasil: ['read'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilFindSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilFindController(params, context);
  },
});

export async function documentacaoRuralBrasilFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['read'],
    },
    context,
  );

  const { id } = documentacaoRuralBrasilFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let documentacaoRuralBrasil = await tx.documentacaoRuralBrasil.findUnique(
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
        },
      );

      documentacaoRuralBrasil = await filePopulateDownloadUrlInTree(
        documentacaoRuralBrasil,
      );

      return documentacaoRuralBrasil;
    },
  );
}

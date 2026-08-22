import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { certificacaoSustentabilidadeRuralFindSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/certificacao-sustentabilidade-rural/{id}',
  params: certificacaoSustentabilidadeRuralFindSchema,
  response: 'CertificacaoSustentabilidadeRural',
};

export const certificacaoSustentabilidadeRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_get',
  description: dictionary.certificacaoSustentabilidadeRural.mcpDescription.get,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['read'] },
  schema: toMcpJsonSchema(certificacaoSustentabilidadeRuralFindSchema),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralFindController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['read'],
    },
    context,
  );

  const { id } = certificacaoSustentabilidadeRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let certificacaoSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findUnique({
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

      certificacaoSustentabilidadeRural = await filePopulateDownloadUrlInTree(
        certificacaoSustentabilidadeRural,
      );

      return certificacaoSustentabilidadeRural;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ativoIncluidoVendaRuralFindSchema } from '../ativoIncluidoVendaRuralSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ativoIncluidoVendaRuralFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/ativo-incluido-venda-rural/{id}',
  params: ativoIncluidoVendaRuralFindSchema,
  response: 'AtivoIncluidoVendaRural',
};

export const ativoIncluidoVendaRuralFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ativoIncluidoVendaRural_get',
  description: dictionary.ativoIncluidoVendaRural.mcpDescription.get,
  requiredPermissions: { ativoIncluidoVendaRural: ['read'] },
  schema: toMcpJsonSchema(ativoIncluidoVendaRuralFindSchema),
  handler: async (params, context) => {
    return await ativoIncluidoVendaRuralFindController(params, context);
  },
});

export async function ativoIncluidoVendaRuralFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ativoIncluidoVendaRural: ['read'],
    },
    context,
  );

  const { id } = ativoIncluidoVendaRuralFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let ativoIncluidoVendaRural = await tx.ativoIncluidoVendaRural.findUnique(
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

      ativoIncluidoVendaRural = await filePopulateDownloadUrlInTree(
        ativoIncluidoVendaRural,
      );

      return ativoIncluidoVendaRural;
    },
  );
}

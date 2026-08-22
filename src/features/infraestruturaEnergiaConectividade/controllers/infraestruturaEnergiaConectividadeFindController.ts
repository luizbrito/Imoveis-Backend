import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { infraestruturaEnergiaConectividadeFindSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/infraestrutura-energia-conectividade/{id}',
  params: infraestruturaEnergiaConectividadeFindSchema,
  response: 'InfraestruturaEnergiaConectividade',
};

export const infraestruturaEnergiaConectividadeFindMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_get',
  description: dictionary.infraestruturaEnergiaConectividade.mcpDescription.get,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['read'] },
  schema: toMcpJsonSchema(infraestruturaEnergiaConectividadeFindSchema),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeFindController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['read'],
    },
    context,
  );

  const { id } = infraestruturaEnergiaConectividadeFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let infraestruturaEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.findUnique({
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

      infraestruturaEnergiaConectividade = await filePopulateDownloadUrlInTree(
        infraestruturaEnergiaConectividade,
      );

      return infraestruturaEnergiaConectividade;
    },
  );
}

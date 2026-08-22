import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ocorrenciaImovelDeleteManyInputSchema } from '../ocorrenciaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/ocorrencia-imovel',
  query: ocorrenciaImovelDeleteManyInputSchema,
};

export const ocorrenciaImovelDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_delete_many',
  description: dictionary.ocorrenciaImovel.mcpDescription.delete,
  requiredPermissions: { ocorrenciaImovel: ['delete'] },
  schema: toMcpJsonSchema(ocorrenciaImovelDeleteManyInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelDeleteManyController(params, context);
  },
});

export async function ocorrenciaImovelDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['delete'],
    },
    context,
  );

  const { ids } = ocorrenciaImovelDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const ocorrenciasImovelToDelete = await tx.ocorrenciaImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
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
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.ocorrenciaImovel.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const ocorrenciaImovel of ocorrenciasImovelToDelete) {
        await auditLogCreate({
          entityId: ocorrenciaImovel.id,
          entityName: 'OcorrenciaImovel',
          operation: auditLogOperations.delete,
          context,
          oldData: ocorrenciaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ocorrenciaImovelRestoreManyInputSchema } from '../ocorrenciaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ocorrencia-imovel/restore',
  query: ocorrenciaImovelRestoreManyInputSchema,
};

export const ocorrenciaImovelRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrencia-imovel_restore_many',
  description: dictionary.ocorrenciaImovel.mcpDescription.restore,
  requiredPermissions: { ocorrenciaImovel: ['restore'] },
  schema: toMcpJsonSchema(ocorrenciaImovelRestoreManyInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelRestoreManyController(params, context);
  },
});

export async function ocorrenciaImovelRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['restore'],
    },
    context,
  );

  const { ids } = ocorrenciaImovelRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldOcorrenciasImovel = await tx.ocorrenciaImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      const result = await tx.ocorrenciaImovel.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newOcorrenciasImovel = await tx.ocorrenciaImovel.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        select: {
          id: true,
          archivedAt: true,
          archivedByMemberId: true,
        },
      });

      for (const oldOcorrenciaImovel of oldOcorrenciasImovel) {
        const newOcorrenciaImovel = newOcorrenciasImovel.find(
          (c) => c.id === oldOcorrenciaImovel.id,
        );
        await auditLogCreate({
          entityId: oldOcorrenciaImovel.id,
          entityName: 'OcorrenciaImovel',
          operation: auditLogOperations.update,
          context,
          oldData: oldOcorrenciaImovel,
          newData: newOcorrenciaImovel,
          tx,
        });
      }

      return result;
    },
  );
}

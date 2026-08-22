import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { ocorrenciaImovelArchiveManyInputSchema as ocorrenciaImovelArchiveManyInputSchema } from '../ocorrenciaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/ocorrencia-imovel/archive',
  query: ocorrenciaImovelArchiveManyInputSchema,
};

export const ocorrenciaImovelArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrencia-imovel_archive_many',
  description: dictionary.ocorrenciaImovel.mcpDescription.archive,
  requiredPermissions: { ocorrenciaImovel: ['archive'] },
  schema: toMcpJsonSchema(ocorrenciaImovelArchiveManyInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelArchiveManyController(params, context);
  },
});

export async function ocorrenciaImovelArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      ocorrenciaImovel: ['archive'],
    },
    context,
  );

  const { ids } = ocorrenciaImovelArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

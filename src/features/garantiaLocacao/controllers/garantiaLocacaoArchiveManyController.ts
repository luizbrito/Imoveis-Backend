import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { garantiaLocacaoArchiveManyInputSchema as garantiaLocacaoArchiveManyInputSchema } from '../garantiaLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const garantiaLocacaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/garantia-locacao/archive',
  query: garantiaLocacaoArchiveManyInputSchema,
};

export const garantiaLocacaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'garantia-locacao_archive_many',
  description: dictionary.garantiaLocacao.mcpDescription.archive,
  requiredPermissions: { garantiaLocacao: ['archive'] },
  schema: toMcpJsonSchema(garantiaLocacaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await garantiaLocacaoArchiveManyController(params, context);
  },
});

export async function garantiaLocacaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      garantiaLocacao: ['archive'],
    },
    context,
  );

  const { ids } = garantiaLocacaoArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldGarantiasLocacao = await tx.garantiaLocacao.findMany({
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

      const result = await tx.garantiaLocacao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newGarantiasLocacao = await tx.garantiaLocacao.findMany({
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

      for (const oldGarantiaLocacao of oldGarantiasLocacao) {
        const newGarantiaLocacao = newGarantiasLocacao.find(
          (c) => c.id === oldGarantiaLocacao.id,
        );
        await auditLogCreate({
          entityId: oldGarantiaLocacao.id,
          entityName: 'GarantiaLocacao',
          operation: auditLogOperations.update,
          context,
          oldData: oldGarantiaLocacao,
          newData: newGarantiaLocacao,
          tx,
        });
      }

      return result;
    },
  );
}

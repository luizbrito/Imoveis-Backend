import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { consentimentoLGPDRestoreManyInputSchema } from '../consentimentoLGPDSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/consentimento-l-g-p-d/restore',
  query: consentimentoLGPDRestoreManyInputSchema,
};

export const consentimentoLGPDRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimento-l-g-p-d_restore_many',
  description: dictionary.consentimentoLGPD.mcpDescription.restore,
  requiredPermissions: { consentimentoLGPD: ['restore'] },
  schema: toMcpJsonSchema(consentimentoLGPDRestoreManyInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDRestoreManyController(params, context);
  },
});

export async function consentimentoLGPDRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['restore'],
    },
    context,
  );

  const { ids } = consentimentoLGPDRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldConsentimentosLGPD = await tx.consentimentoLGPD.findMany({
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

      const result = await tx.consentimentoLGPD.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newConsentimentosLGPD = await tx.consentimentoLGPD.findMany({
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

      for (const oldConsentimentoLGPD of oldConsentimentosLGPD) {
        const newConsentimentoLGPD = newConsentimentosLGPD.find(
          (c) => c.id === oldConsentimentoLGPD.id,
        );
        await auditLogCreate({
          entityId: oldConsentimentoLGPD.id,
          entityName: 'ConsentimentoLGPD',
          operation: auditLogOperations.update,
          context,
          oldData: oldConsentimentoLGPD,
          newData: newConsentimentoLGPD,
          tx,
        });
      }

      return result;
    },
  );
}

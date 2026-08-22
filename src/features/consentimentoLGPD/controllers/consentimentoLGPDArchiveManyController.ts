import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { consentimentoLGPDArchiveManyInputSchema as consentimentoLGPDArchiveManyInputSchema } from '../consentimentoLGPDSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/consentimento-l-g-p-d/archive',
  query: consentimentoLGPDArchiveManyInputSchema,
};

export const consentimentoLGPDArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimento-l-g-p-d_archive_many',
  description: dictionary.consentimentoLGPD.mcpDescription.archive,
  requiredPermissions: { consentimentoLGPD: ['archive'] },
  schema: toMcpJsonSchema(consentimentoLGPDArchiveManyInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDArchiveManyController(params, context);
  },
});

export async function consentimentoLGPDArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['archive'],
    },
    context,
  );

  const { ids } = consentimentoLGPDArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

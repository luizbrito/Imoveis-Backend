import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { certificacaoSustentabilidadeRuralRestoreManyInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/certificacao-sustentabilidade-rural/restore',
  query: certificacaoSustentabilidadeRuralRestoreManyInputSchema,
};

export const certificacaoSustentabilidadeRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacao-sustentabilidade-rural_restore_many',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.restore,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['restore'] },
  schema: toMcpJsonSchema(
    certificacaoSustentabilidadeRuralRestoreManyInputSchema,
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralRestoreManyController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['restore'],
    },
    context,
  );

  const { ids } =
    certificacaoSustentabilidadeRuralRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldCertificacoesSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findMany({
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

      const result = await tx.certificacaoSustentabilidadeRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newCertificacoesSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findMany({
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

      for (const oldCertificacaoSustentabilidadeRural of oldCertificacoesSustentabilidadeRural) {
        const newCertificacaoSustentabilidadeRural =
          newCertificacoesSustentabilidadeRural.find(
            (c) => c.id === oldCertificacaoSustentabilidadeRural.id,
          );
        await auditLogCreate({
          entityId: oldCertificacaoSustentabilidadeRural.id,
          entityName: 'CertificacaoSustentabilidadeRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldCertificacaoSustentabilidadeRural,
          newData: newCertificacaoSustentabilidadeRural,
          tx,
        });
      }

      return result;
    },
  );
}

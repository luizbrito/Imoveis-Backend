import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { certificacaoSustentabilidadeRuralArchiveManyInputSchema as certificacaoSustentabilidadeRuralArchiveManyInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/certificacao-sustentabilidade-rural/archive',
  query: certificacaoSustentabilidadeRuralArchiveManyInputSchema,
};

export const certificacaoSustentabilidadeRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacao-sustentabilidade-rural_archive_many',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.archive,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['archive'] },
  schema: toMcpJsonSchema(
    certificacaoSustentabilidadeRuralArchiveManyInputSchema,
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralArchiveManyController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['archive'],
    },
    context,
  );

  const { ids } =
    certificacaoSustentabilidadeRuralArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { sistemaProdutivoRuralArchiveManyInputSchema as sistemaProdutivoRuralArchiveManyInputSchema } from '../sistemaProdutivoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/sistema-produtivo-rural/archive',
  query: sistemaProdutivoRuralArchiveManyInputSchema,
};

export const sistemaProdutivoRuralArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistema-produtivo-rural_archive_many',
  description: dictionary.sistemaProdutivoRural.mcpDescription.archive,
  requiredPermissions: { sistemaProdutivoRural: ['archive'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralArchiveManyInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralArchiveManyController(params, context);
  },
});

export async function sistemaProdutivoRuralArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['archive'],
    },
    context,
  );

  const { ids } = sistemaProdutivoRuralArchiveManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldSistemasProdutivosRurais =
        await tx.sistemaProdutivoRural.findMany({
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

      const result = await tx.sistemaProdutivoRural.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
        },
      });

      const newSistemasProdutivosRurais =
        await tx.sistemaProdutivoRural.findMany({
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

      for (const oldSistemaProdutivoRural of oldSistemasProdutivosRurais) {
        const newSistemaProdutivoRural = newSistemasProdutivosRurais.find(
          (c) => c.id === oldSistemaProdutivoRural.id,
        );
        await auditLogCreate({
          entityId: oldSistemaProdutivoRural.id,
          entityName: 'SistemaProdutivoRural',
          operation: auditLogOperations.update,
          context,
          oldData: oldSistemaProdutivoRural,
          newData: newSistemaProdutivoRural,
          tx,
        });
      }

      return result;
    },
  );
}

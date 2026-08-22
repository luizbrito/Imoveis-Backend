import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { sistemaProdutivoRuralRestoreManyInputSchema } from '../sistemaProdutivoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/sistema-produtivo-rural/restore',
  query: sistemaProdutivoRuralRestoreManyInputSchema,
};

export const sistemaProdutivoRuralRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistema-produtivo-rural_restore_many',
  description: dictionary.sistemaProdutivoRural.mcpDescription.restore,
  requiredPermissions: { sistemaProdutivoRural: ['restore'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralRestoreManyInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralRestoreManyController(params, context);
  },
});

export async function sistemaProdutivoRuralRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['restore'],
    },
    context,
  );

  const { ids } = sistemaProdutivoRuralRestoreManyInputSchema.parse(query);

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
          archivedAt: null,
          archivedByMemberId: null,
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

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoAdministracaoRestoreManyInputSchema } from '../contratoAdministracaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-administracao/restore',
  query: contratoAdministracaoRestoreManyInputSchema,
};

export const contratoAdministracaoRestoreManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-administracao_restore_many',
  description: dictionary.contratoAdministracao.mcpDescription.restore,
  requiredPermissions: { contratoAdministracao: ['restore'] },
  schema: toMcpJsonSchema(contratoAdministracaoRestoreManyInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoRestoreManyController(params, context);
  },
});

export async function contratoAdministracaoRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['restore'],
    },
    context,
  );

  const { ids } = contratoAdministracaoRestoreManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldContratosAdministracao = await tx.contratoAdministracao.findMany(
        {
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        },
      );

      const result = await tx.contratoAdministracao.updateMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        data: {
          archivedAt: null,
          archivedByMemberId: null,
        },
      });

      const newContratosAdministracao = await tx.contratoAdministracao.findMany(
        {
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          select: {
            id: true,
            archivedAt: true,
            archivedByMemberId: true,
          },
        },
      );

      for (const oldContratoAdministracao of oldContratosAdministracao) {
        const newContratoAdministracao = newContratosAdministracao.find(
          (c) => c.id === oldContratoAdministracao.id,
        );
        await auditLogCreate({
          entityId: oldContratoAdministracao.id,
          entityName: 'ContratoAdministracao',
          operation: auditLogOperations.update,
          context,
          oldData: oldContratoAdministracao,
          newData: newContratoAdministracao,
          tx,
        });
      }

      return result;
    },
  );
}

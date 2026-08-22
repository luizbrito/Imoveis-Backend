import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoAdministracaoArchiveManyInputSchema as contratoAdministracaoArchiveManyInputSchema } from '../contratoAdministracaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/contrato-administracao/archive',
  query: contratoAdministracaoArchiveManyInputSchema,
};

export const contratoAdministracaoArchiveManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contrato-administracao_archive_many',
  description: dictionary.contratoAdministracao.mcpDescription.archive,
  requiredPermissions: { contratoAdministracao: ['archive'] },
  schema: toMcpJsonSchema(contratoAdministracaoArchiveManyInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoArchiveManyController(params, context);
  },
});

export async function contratoAdministracaoArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentMember, currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['archive'],
    },
    context,
  );

  const { ids } = contratoAdministracaoArchiveManyInputSchema.parse(query);

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
          archivedAt: new Date(),
          archivedByMemberId: currentMember.id,
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

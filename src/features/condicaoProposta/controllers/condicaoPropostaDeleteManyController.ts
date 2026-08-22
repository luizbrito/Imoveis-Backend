import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { condicaoPropostaDeleteManyInputSchema } from '../condicaoPropostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condicaoPropostaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/condicao-proposta',
  query: condicaoPropostaDeleteManyInputSchema,
};

export const condicaoPropostaDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'condicaoProposta_delete_many',
  description: dictionary.condicaoProposta.mcpDescription.delete,
  requiredPermissions: { condicaoProposta: ['delete'] },
  schema: toMcpJsonSchema(condicaoPropostaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await condicaoPropostaDeleteManyController(params, context);
  },
});

export async function condicaoPropostaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      condicaoProposta: ['delete'],
    },
    context,
  );

  const { ids } = condicaoPropostaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const condicoesPropostaToDelete = await tx.condicaoProposta.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          proposta: {
            select: {
              id: true,
              codigo: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = await tx.condicaoProposta.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const condicaoProposta of condicoesPropostaToDelete) {
        await auditLogCreate({
          entityId: condicaoProposta.id,
          entityName: 'CondicaoProposta',
          operation: auditLogOperations.delete,
          context,
          oldData: condicaoProposta,
          tx,
        });
      }

      return result;
    },
  );
}

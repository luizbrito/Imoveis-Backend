import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoAdministracaoDeleteManyInputSchema } from '../contratoAdministracaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoAdministracaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/contrato-administracao',
  query: contratoAdministracaoDeleteManyInputSchema,
};

export const contratoAdministracaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoAdministracao_delete_many',
  description: dictionary.contratoAdministracao.mcpDescription.delete,
  requiredPermissions: { contratoAdministracao: ['delete'] },
  schema: toMcpJsonSchema(contratoAdministracaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await contratoAdministracaoDeleteManyController(params, context);
  },
});

export async function contratoAdministracaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoAdministracao: ['delete'],
    },
    context,
  );

  const { ids } = contratoAdministracaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const contratosAdministracaoToDelete =
        await tx.contratoAdministracao.findMany({
          where: {
            id: { in: ids },
            organizationId: currentOrganization.id,
          },
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            proprietario: {
              select: {
                id: true,
                nomeRazaoSocial: true,
              },
            },
            filial: {
              select: {
                id: true,
                nome: true,
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

      const result = await tx.contratoAdministracao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const contratoAdministracao of contratosAdministracaoToDelete) {
        await auditLogCreate({
          entityId: contratoAdministracao.id,
          entityName: 'ContratoAdministracao',
          operation: auditLogOperations.delete,
          context,
          oldData: contratoAdministracao,
          tx,
        });
      }

      return result;
    },
  );
}

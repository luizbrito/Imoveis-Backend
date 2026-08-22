import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { contratoLocacaoDeleteManyInputSchema } from '../contratoLocacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoLocacaoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/contrato-locacao',
  query: contratoLocacaoDeleteManyInputSchema,
};

export const contratoLocacaoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoLocacao_delete_many',
  description: dictionary.contratoLocacao.mcpDescription.delete,
  requiredPermissions: { contratoLocacao: ['delete'] },
  schema: toMcpJsonSchema(contratoLocacaoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await contratoLocacaoDeleteManyController(params, context);
  },
});

export async function contratoLocacaoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      contratoLocacao: ['delete'],
    },
    context,
  );

  const { ids } = contratoLocacaoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const contratosLocacaoToDelete = await tx.contratoLocacao.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          locacao: {
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

      const result = await tx.contratoLocacao.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const contratoLocacao of contratosLocacaoToDelete) {
        await auditLogCreate({
          entityId: contratoLocacao.id,
          entityName: 'ContratoLocacao',
          operation: auditLogOperations.delete,
          context,
          oldData: contratoLocacao,
          tx,
        });
      }

      return result;
    },
  );
}

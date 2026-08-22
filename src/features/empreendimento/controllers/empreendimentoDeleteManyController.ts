import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { empreendimentoDeleteManyInputSchema } from '../empreendimentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const empreendimentoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/empreendimento',
  query: empreendimentoDeleteManyInputSchema,
};

export const empreendimentoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'empreendimento_delete_many',
  description: dictionary.empreendimento.mcpDescription.delete,
  requiredPermissions: { empreendimento: ['delete'] },
  schema: toMcpJsonSchema(empreendimentoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await empreendimentoDeleteManyController(params, context);
  },
});

export async function empreendimentoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      empreendimento: ['delete'],
    },
    context,
  );

  const { ids } = empreendimentoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const empreendimentosToDelete = await tx.empreendimento.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          unidades: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
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

      const result = await tx.empreendimento.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const empreendimento of empreendimentosToDelete) {
        await auditLogCreate({
          entityId: empreendimento.id,
          entityName: 'Empreendimento',
          operation: auditLogOperations.delete,
          context,
          oldData: empreendimento,
          tx,
        });
      }

      return result;
    },
  );
}

import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { vistoriaDeleteManyInputSchema } from '../vistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/vistoria',
  query: vistoriaDeleteManyInputSchema,
};

export const vistoriaDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_delete_many',
  description: dictionary.vistoria.mcpDescription.delete,
  requiredPermissions: { vistoria: ['delete'] },
  schema: toMcpJsonSchema(vistoriaDeleteManyInputSchema),
  handler: async (params, context) => {
    return await vistoriaDeleteManyController(params, context);
  },
});

export async function vistoriaDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      vistoria: ['delete'],
    },
    context,
  );

  const { ids } = vistoriaDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const vistoriasToDelete = await tx.vistoria.findMany({
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
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          itens: {
            select: {
              id: true,
              item: true,
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

      const result = await tx.vistoria.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const vistoria of vistoriasToDelete) {
        await auditLogCreate({
          entityId: vistoria.id,
          entityName: 'Vistoria',
          operation: auditLogOperations.delete,
          context,
          oldData: vistoria,
          tx,
        });
      }

      return result;
    },
  );
}

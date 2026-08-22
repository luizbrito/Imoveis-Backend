import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { sistemaProdutivoRuralDeleteManyInputSchema } from '../sistemaProdutivoRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const sistemaProdutivoRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/sistema-produtivo-rural',
  query: sistemaProdutivoRuralDeleteManyInputSchema,
};

export const sistemaProdutivoRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'sistemaProdutivoRural_delete_many',
  description: dictionary.sistemaProdutivoRural.mcpDescription.delete,
  requiredPermissions: { sistemaProdutivoRural: ['delete'] },
  schema: toMcpJsonSchema(sistemaProdutivoRuralDeleteManyInputSchema),
  handler: async (params, context) => {
    return await sistemaProdutivoRuralDeleteManyController(params, context);
  },
});

export async function sistemaProdutivoRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      sistemaProdutivoRural: ['delete'],
    },
    context,
  );

  const { ids } = sistemaProdutivoRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const sistemasProdutivosRuraisToDelete =
        await tx.sistemaProdutivoRural.findMany({
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

      const result = await tx.sistemaProdutivoRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const sistemaProdutivoRural of sistemasProdutivosRuraisToDelete) {
        await auditLogCreate({
          entityId: sistemaProdutivoRural.id,
          entityName: 'SistemaProdutivoRural',
          operation: auditLogOperations.delete,
          context,
          oldData: sistemaProdutivoRural,
          tx,
        });
      }

      return result;
    },
  );
}

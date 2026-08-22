import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { documentacaoRuralBrasilDeleteManyInputSchema } from '../documentacaoRuralBrasilSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const documentacaoRuralBrasilDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/documentacao-rural-brasil',
  query: documentacaoRuralBrasilDeleteManyInputSchema,
};

export const documentacaoRuralBrasilDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'documentacaoRuralBrasil_delete_many',
  description: dictionary.documentacaoRuralBrasil.mcpDescription.delete,
  requiredPermissions: { documentacaoRuralBrasil: ['delete'] },
  schema: toMcpJsonSchema(documentacaoRuralBrasilDeleteManyInputSchema),
  handler: async (params, context) => {
    return await documentacaoRuralBrasilDeleteManyController(params, context);
  },
});

export async function documentacaoRuralBrasilDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      documentacaoRuralBrasil: ['delete'],
    },
    context,
  );

  const { ids } = documentacaoRuralBrasilDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const documentacoesRuraisBrasilToDelete =
        await tx.documentacaoRuralBrasil.findMany({
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

      const result = await tx.documentacaoRuralBrasil.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const documentacaoRuralBrasil of documentacoesRuraisBrasilToDelete) {
        await auditLogCreate({
          entityId: documentacaoRuralBrasil.id,
          entityName: 'DocumentacaoRuralBrasil',
          operation: auditLogOperations.delete,
          context,
          oldData: documentacaoRuralBrasil,
          tx,
        });
      }

      return result;
    },
  );
}

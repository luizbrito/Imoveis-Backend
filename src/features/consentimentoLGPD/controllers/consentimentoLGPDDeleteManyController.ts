import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { consentimentoLGPDDeleteManyInputSchema } from '../consentimentoLGPDSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const consentimentoLGPDDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/consentimento-l-g-p-d',
  query: consentimentoLGPDDeleteManyInputSchema,
};

export const consentimentoLGPDDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'consentimentoLGPD_delete_many',
  description: dictionary.consentimentoLGPD.mcpDescription.delete,
  requiredPermissions: { consentimentoLGPD: ['delete'] },
  schema: toMcpJsonSchema(consentimentoLGPDDeleteManyInputSchema),
  handler: async (params, context) => {
    return await consentimentoLGPDDeleteManyController(params, context);
  },
});

export async function consentimentoLGPDDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      consentimentoLGPD: ['delete'],
    },
    context,
  );

  const { ids } = consentimentoLGPDDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const consentimentosLGPDToDelete = await tx.consentimentoLGPD.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          lead: {
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

      const result = await tx.consentimentoLGPD.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const consentimentoLGPD of consentimentosLGPDToDelete) {
        await auditLogCreate({
          entityId: consentimentoLGPD.id,
          entityName: 'ConsentimentoLGPD',
          operation: auditLogOperations.delete,
          context,
          oldData: consentimentoLGPD,
          tx,
        });
      }

      return result;
    },
  );
}

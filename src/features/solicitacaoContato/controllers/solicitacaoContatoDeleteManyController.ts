import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { solicitacaoContatoDeleteManyInputSchema } from '../solicitacaoContatoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/solicitacao-contato',
  query: solicitacaoContatoDeleteManyInputSchema,
};

export const solicitacaoContatoDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_delete_many',
  description: dictionary.solicitacaoContato.mcpDescription.delete,
  requiredPermissions: { solicitacaoContato: ['delete'] },
  schema: toMcpJsonSchema(solicitacaoContatoDeleteManyInputSchema),
  handler: async (params, context) => {
    return await solicitacaoContatoDeleteManyController(params, context);
  },
});

export async function solicitacaoContatoDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['delete'],
    },
    context,
  );

  const { ids } = solicitacaoContatoDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const solicitacoesContatoToDelete = await tx.solicitacaoContato.findMany({
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
          anuncio: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
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

      const result = await tx.solicitacaoContato.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const solicitacaoContato of solicitacoesContatoToDelete) {
        await auditLogCreate({
          entityId: solicitacaoContato.id,
          entityName: 'SolicitacaoContato',
          operation: auditLogOperations.delete,
          context,
          oldData: solicitacaoContato,
          tx,
        });
      }

      return result;
    },
  );
}

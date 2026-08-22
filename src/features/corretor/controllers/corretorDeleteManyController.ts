import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { corretorDeleteManyInputSchema } from '../corretorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/corretor',
  query: corretorDeleteManyInputSchema,
};

export const corretorDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_delete_many',
  description: dictionary.corretor.mcpDescription.delete,
  requiredPermissions: { corretor: ['delete'] },
  schema: toMcpJsonSchema(corretorDeleteManyInputSchema),
  handler: async (params, context) => {
    return await corretorDeleteManyController(params, context);
  },
});

export async function corretorDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['delete'],
    },
    context,
  );

  const { ids } = corretorDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const corretoresToDelete = await tx.corretor.findMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
        include: {
          contaMembro: {
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
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisCaptados: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          avaliacoesRealizadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistoriasResponsaveis: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anunciosResponsaveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leadsResponsaveis: {
            select: {
              id: true,
              nome: true,
            },
          },
          interacoesRealizadas: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefasAtribuidas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitasConduzidas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          solicitacoesAtendidas: {
            select: {
              id: true,
              nome: true,
            },
          },
          ocorrenciasGerenciadas: {
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

      const result = await tx.corretor.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const corretor of corretoresToDelete) {
        await auditLogCreate({
          entityId: corretor.id,
          entityName: 'Corretor',
          operation: auditLogOperations.delete,
          context,
          oldData: corretor,
          tx,
        });
      }

      return result;
    },
  );
}

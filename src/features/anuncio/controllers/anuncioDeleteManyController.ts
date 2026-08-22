import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { anuncioDeleteManyInputSchema } from '../anuncioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const anuncioDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/anuncio',
  query: anuncioDeleteManyInputSchema,
};

export const anuncioDeleteManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'anuncio_delete_many',
  description: dictionary.anuncio.mcpDescription.delete,
  requiredPermissions: { anuncio: ['delete'] },
  schema: toMcpJsonSchema(anuncioDeleteManyInputSchema),
  handler: async (params, context) => {
    return await anuncioDeleteManyController(params, context);
  },
});

export async function anuncioDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      anuncio: ['delete'],
    },
    context,
  );

  const { ids } = anuncioDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const anunciosToDelete = await tx.anuncio.findMany({
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
          publicacoesPortais: {
            select: {
              id: true,
              codigoExterno: true,
            },
          },
          campanhasVinculadas: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          leadsGerados: {
            select: {
              id: true,
              nome: true,
            },
          },
          solicitacoesContato: {
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

      const result = await tx.anuncio.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const anuncio of anunciosToDelete) {
        await auditLogCreate({
          entityId: anuncio.id,
          entityName: 'Anuncio',
          operation: auditLogOperations.delete,
          context,
          oldData: anuncio,
          tx,
        });
      }

      return result;
    },
  );
}

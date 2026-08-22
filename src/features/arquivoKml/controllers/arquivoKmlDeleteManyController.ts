import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { arquivoKmlDeleteManyInputSchema } from '../arquivoKmlSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/arquivo-kml',
  query: arquivoKmlDeleteManyInputSchema,
};

export const arquivoKmlDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'arquivoKml_delete_many',
  description: dictionary.arquivoKml.mcpDescription.delete,
  requiredPermissions: { arquivoKml: ['delete'] },
  schema: toMcpJsonSchema(arquivoKmlDeleteManyInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlDeleteManyController(params, context);
  },
});

export async function arquivoKmlDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['delete'],
    },
    context,
  );

  const { ids } = arquivoKmlDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const arquivosKmlToDelete = await tx.arquivoKml.findMany({
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
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          condominio: {
            select: {
              id: true,
              nome: true,
            },
          },
          cadastradoPor: {
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
          versoesPosteriores: {
            select: {
              id: true,
              nome: true,
            },
          },
          documentacaoRuralBrasil: {
            select: {
              id: true,
              matriculaNumero: true,
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

      const result = await tx.arquivoKml.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const arquivoKml of arquivosKmlToDelete) {
        await auditLogCreate({
          entityId: arquivoKml.id,
          entityName: 'ArquivoKml',
          operation: auditLogOperations.delete,
          context,
          oldData: arquivoKml,
          tx,
        });
      }

      return result;
    },
  );
}

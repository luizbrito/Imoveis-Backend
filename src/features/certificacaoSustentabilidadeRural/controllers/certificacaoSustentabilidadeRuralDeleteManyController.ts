import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { certificacaoSustentabilidadeRuralDeleteManyInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralDeleteManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/certificacao-sustentabilidade-rural',
  query: certificacaoSustentabilidadeRuralDeleteManyInputSchema,
};

export const certificacaoSustentabilidadeRuralDeleteManyMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_delete_many',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.delete,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['delete'] },
  schema: toMcpJsonSchema(
    certificacaoSustentabilidadeRuralDeleteManyInputSchema,
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralDeleteManyController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralDeleteManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['delete'],
    },
    context,
  );

  const { ids } =
    certificacaoSustentabilidadeRuralDeleteManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const certificacoesSustentabilidadeRuralToDelete =
        await tx.certificacaoSustentabilidadeRural.findMany({
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

      const result = await tx.certificacaoSustentabilidadeRural.deleteMany({
        where: {
          id: { in: ids },
          organizationId: currentOrganization.id,
        },
      });

      for (const certificacaoSustentabilidadeRural of certificacoesSustentabilidadeRuralToDelete) {
        await auditLogCreate({
          entityId: certificacaoSustentabilidadeRural.id,
          entityName: 'CertificacaoSustentabilidadeRural',
          operation: auditLogOperations.delete,
          context,
          oldData: certificacaoSustentabilidadeRural,
          tx,
        });
      }

      return result;
    },
  );
}

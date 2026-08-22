import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  certificacaoSustentabilidadeRuralUpdateBodyInputSchema,
  certificacaoSustentabilidadeRuralUpdateParamsInputSchema,
} from '../certificacaoSustentabilidadeRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/certificacao-sustentabilidade-rural/{id}',
  params: certificacaoSustentabilidadeRuralUpdateParamsInputSchema,
  body: certificacaoSustentabilidadeRuralUpdateBodyInputSchema,
  response: 'CertificacaoSustentabilidadeRural',
};

export const certificacaoSustentabilidadeRuralUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_update',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.update,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: certificacaoSustentabilidadeRuralUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['update'],
    },
    context,
  );

  const { id } =
    certificacaoSustentabilidadeRuralUpdateParamsInputSchema.parse(params);

  const data =
    certificacaoSustentabilidadeRuralUpdateBodyInputSchema.parse(body);

  let certificacaoSustentabilidadeRural = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCertificacaoSustentabilidadeRural =
          await tx.certificacaoSustentabilidadeRural.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentCertificacaoSustentabilidadeRural) {
          const currentUpdatedAt =
            currentCertificacaoSustentabilidadeRural.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldCertificacaoSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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

      await tx.certificacaoSustentabilidadeRural.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipo: data.tipo,
          entidadeCertificadora: data.entidadeCertificadora,
          numeroCertificado: data.numeroCertificado,
          dataEmissao: data.dataEmissao,
          dataValidade: data.dataValidade,
          status: data.status,
          areaCertificadaHa: data.areaCertificadaHa,
          potencialCreditoCarbono: data.potencialCreditoCarbono,
          projetoCarbonoAtivo: data.projetoCarbonoAtivo,
          estimativaCarbonoTco2e: data.estimativaCarbonoTco2e,
          documentos: data.documentos,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCertificacaoSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
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

      await auditLogCreate({
        entityId: id,
        entityName: 'CertificacaoSustentabilidadeRural',
        operation: auditLogOperations.update,
        context,
        oldData: oldCertificacaoSustentabilidadeRural,
        newData: updatedCertificacaoSustentabilidadeRural,
        tx,
      });

      return updatedCertificacaoSustentabilidadeRural;
    },
  );

  certificacaoSustentabilidadeRural = await filePopulateDownloadUrlInTree(
    certificacaoSustentabilidadeRural,
  );

  return certificacaoSustentabilidadeRural;
}

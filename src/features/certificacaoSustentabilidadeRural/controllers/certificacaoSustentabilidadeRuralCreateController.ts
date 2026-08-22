import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { certificacaoSustentabilidadeRuralCreateInputSchema } from '../certificacaoSustentabilidadeRuralSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const certificacaoSustentabilidadeRuralCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/certificacao-sustentabilidade-rural',
  body: certificacaoSustentabilidadeRuralCreateInputSchema,
  response: 'CertificacaoSustentabilidadeRural',
};

export const certificacaoSustentabilidadeRuralCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'certificacaoSustentabilidadeRural_create',
  description:
    dictionary.certificacaoSustentabilidadeRural.mcpDescription.create,
  requiredPermissions: { certificacaoSustentabilidadeRural: ['create'] },
  schema: toMcpJsonSchema(certificacaoSustentabilidadeRuralCreateInputSchema),
  handler: async (params, context) => {
    return await certificacaoSustentabilidadeRuralCreateController(
      params,
      context,
    );
  },
});

export async function certificacaoSustentabilidadeRuralCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      certificacaoSustentabilidadeRural: ['create'],
    },
    context,
  );
  return await certificacaoSustentabilidadeRuralCreate(body, context);
}

export async function certificacaoSustentabilidadeRuralCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = certificacaoSustentabilidadeRuralCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCertificacaoSustentabilidadeRural =
        await tx.certificacaoSustentabilidadeRural.create({
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
            imovel: prismaRelationship.connectOneOrThrow(data.imovel),
            importHash: data.importHash,
            organization: prismaRelationship.connectOneOrThrow(
              context.currentOrganization!.id,
            ),
            createdByMember: prismaRelationship.connectOne(
              context.currentMember?.id,
            ),
            createdByUserId: context.currentUser?.id,
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
        entityId: newCertificacaoSustentabilidadeRural.id,
        entityName: 'CertificacaoSustentabilidadeRural',
        operation: auditLogOperations.create,
        context,
        newData: newCertificacaoSustentabilidadeRural,
        tx,
      });

      const certificacaoSustentabilidadeRural =
        await filePopulateDownloadUrlInTree(
          newCertificacaoSustentabilidadeRural,
        );

      return certificacaoSustentabilidadeRural;
    },
  );
}

import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { captacaoImovelCreateInputSchema } from '../captacaoImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const captacaoImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/captacao-imovel',
  body: captacaoImovelCreateInputSchema,
  response: 'CaptacaoImovel',
};

export const captacaoImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'captacaoImovel_create',
  description: dictionary.captacaoImovel.mcpDescription.create,
  requiredPermissions: { captacaoImovel: ['create'] },
  schema: toMcpJsonSchema(captacaoImovelCreateInputSchema),
  handler: async (params, context) => {
    return await captacaoImovelCreateController(params, context);
  },
});

export async function captacaoImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      captacaoImovel: ['create'],
    },
    context,
  );
  return await captacaoImovelCreate(body, context);
}

export async function captacaoImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = captacaoImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.captacaoImovel.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.captacaoImovel.fields.codigo,
          ),
        );
      }

      const newCaptacaoImovel = await tx.captacaoImovel.create({
        data: {
          codigo: data.codigo,
          dataCaptacao: data.dataCaptacao,
          tipo: data.tipo,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          percentualComissaoVenda: data.percentualComissaoVenda,
          percentualAdministracao: data.percentualAdministracao,
          valorMinimoAutorizado: data.valorMinimoAutorizado,
          documentos: data.documentos,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
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
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretor: {
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

      await auditLogCreate({
        entityId: newCaptacaoImovel.id,
        entityName: 'CaptacaoImovel',
        operation: auditLogOperations.create,
        context,
        newData: newCaptacaoImovel,
        tx,
      });

      const captacaoImovel =
        await filePopulateDownloadUrlInTree(newCaptacaoImovel);

      return captacaoImovel;
    },
  );
}

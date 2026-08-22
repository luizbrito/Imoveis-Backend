import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ocorrenciaImovelCreateInputSchema } from '../ocorrenciaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ocorrenciaImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ocorrencia-imovel',
  body: ocorrenciaImovelCreateInputSchema,
  response: 'OcorrenciaImovel',
};

export const ocorrenciaImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'ocorrenciaImovel_create',
  description: dictionary.ocorrenciaImovel.mcpDescription.create,
  requiredPermissions: { ocorrenciaImovel: ['create'] },
  schema: toMcpJsonSchema(ocorrenciaImovelCreateInputSchema),
  handler: async (params, context) => {
    return await ocorrenciaImovelCreateController(params, context);
  },
});

export async function ocorrenciaImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      ocorrenciaImovel: ['create'],
    },
    context,
  );
  return await ocorrenciaImovelCreate(body, context);
}

export async function ocorrenciaImovelCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = ocorrenciaImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.ocorrenciaImovel.count({
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
            context.dictionary.ocorrenciaImovel.fields.codigo,
          ),
        );
      }

      const newOcorrenciaImovel = await tx.ocorrenciaImovel.create({
        data: {
          codigo: data.codigo,
          dataHora: data.dataHora,
          tipo: data.tipo,
          gravidade: data.gravidade,
          status: data.status,
          titulo: data.titulo,
          descricao: data.descricao,
          anexos: data.anexos,
          dataResolucao: data.dataResolucao,
          resolucao: data.resolucao,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          locacao: prismaRelationship.connectOne(data.locacao),
          clienteRelator: prismaRelationship.connectOne(data.clienteRelator),
          corretorResponsavel: prismaRelationship.connectOne(
            data.corretorResponsavel,
          ),
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          clienteRelator: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      await auditLogCreate({
        entityId: newOcorrenciaImovel.id,
        entityName: 'OcorrenciaImovel',
        operation: auditLogOperations.create,
        context,
        newData: newOcorrenciaImovel,
        tx,
      });

      const ocorrenciaImovel =
        await filePopulateDownloadUrlInTree(newOcorrenciaImovel);

      return ocorrenciaImovel;
    },
  );
}
